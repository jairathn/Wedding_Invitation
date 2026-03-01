// POST /api/upload/sign — Generate a GCS signed upload URL.
//
// The client uploads directly to GCS using this URL (any size, proper CORS).
// After the upload completes, the client calls /api/upload/complete to move
// the file from GCS → Google Drive.
//
// Request:  { filename, contentType, metadata }
// Response: { signedUrl, objectPath }
//
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const bucketName = process.env.GCS_BUCKET_NAME;

    if (!serviceAccountKey || !bucketName) {
      return res.status(503).json({
        error: 'Storage not configured',
        message: 'GCS_BUCKET_NAME and GOOGLE_SERVICE_ACCOUNT_KEY must be set.',
      });
    }

    const { filename, contentType, metadata } = req.body;
    const meta = (metadata || {}) as Record<string, unknown>;
    const guestName = (meta.guestName as string) || 'unknown';
    const eventSlug = (meta.eventSlug as string) || 'general';
    const safeContentType = (contentType as string) || 'application/octet-stream';

    // Build a unique object path in GCS
    const timestamp = Date.now();
    const safeName = ((filename as string) || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectPath = `uploads/${guestName}/${eventSlug}/${timestamp}_${safeName}`;

    // Parse service account credentials
    const credentials = parseCredentials(serviceAccountKey);

    const { Storage } = await import('@google-cloud/storage');
    const storage = new Storage({
      credentials: {
        client_email: credentials.client_email as string,
        private_key: credentials.private_key as string,
      },
      projectId: credentials.project_id as string,
    });

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectPath);

    const [signedUrl] = await file.generateSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 30 * 60 * 1000, // 30 minutes
      contentType: safeContentType,
    });

    return res.status(200).json({ signedUrl, objectPath });
  } catch (error) {
    console.error('Sign URL error:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}

function parseCredentials(serviceAccountKey: string): Record<string, unknown> {
  const trimmed = serviceAccountKey.trim();
  const json = trimmed.startsWith('{')
    ? trimmed
    : Buffer.from(trimmed, 'base64').toString('utf-8');

  let creds: Record<string, unknown>;
  try {
    creds = JSON.parse(json);
  } catch {
    const fixed = json.replace(
      /("private_key"\s*:\s*")([^"]*)/,
      (_m, pre, val) => pre + val.replace(/\n/g, '\\n').replace(/\r/g, ''),
    );
    creds = JSON.parse(fixed);
  }
  if (typeof creds.private_key === 'string') {
    creds.private_key = creds.private_key.replace(/\\n/g, '\n');
  }
  return creds;
}
