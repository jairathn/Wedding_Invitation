// POST /api/upload/sign — Generate a GCS V4 signed upload URL.
//
// Uses manual V4 signing with Node crypto — no @google-cloud/storage needed.
// The client uploads directly to GCS using this URL (any size, proper CORS).
// After upload, the client calls /api/upload/complete to move GCS → Drive.
//
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

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

    const timestamp = Date.now();
    const safeName = ((filename as string) || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectPath = `uploads/${guestName}/${eventSlug}/${timestamp}_${safeName}`;

    const credentials = parseCredentials(serviceAccountKey);
    const clientEmail = credentials.client_email as string;
    const privateKey = credentials.private_key as string;

    const signedUrl = createV4SignedUrl(bucketName, objectPath, safeContentType, clientEmail, privateKey);

    return res.status(200).json({ signedUrl, objectPath });
  } catch (error) {
    console.error('Sign URL error:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}

// ── Manual GCS V4 signed URL generation ──────────────────────────────

function createV4SignedUrl(
  bucket: string,
  object: string,
  contentType: string,
  clientEmail: string,
  privateKey: string,
): string {
  const now = new Date();
  const datestamp = now.toISOString().replace(/[-:T]/g, '').substring(0, 15) + 'Z';
  const dateOnly = datestamp.substring(0, 8);

  const credentialScope = `${dateOnly}/auto/storage/goog4_request`;
  const host = `storage.googleapis.com`;
  const canonicalUri = `/${bucket}/${object.split('/').map(encodeRfc3986).join('/')}`;

  const expiresSeconds = 1800; // 30 minutes

  const params: [string, string][] = [
    ['X-Goog-Algorithm', 'GOOG4-RSA-SHA256'],
    ['X-Goog-Credential', `${clientEmail}/${credentialScope}`],
    ['X-Goog-Date', datestamp],
    ['X-Goog-Expires', String(expiresSeconds)],
    ['X-Goog-SignedHeaders', 'content-type;host'],
  ];
  params.sort((a, b) => a[0].localeCompare(b[0]));
  const canonicalQueryString = params.map(([k, v]) => `${encodeRfc3986(k)}=${encodeRfc3986(v)}`).join('&');

  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
  const signedHeaders = 'content-type;host';

  const canonicalRequest = [
    'PUT',
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [
    'GOOG4-RSA-SHA256',
    datestamp,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(stringToSign);
  const signature = sign.sign(privateKey, 'hex');

  return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Goog-Signature=${signature}`;
}

function encodeRfc3986(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

// ── Credential parsing ───────────────────────────────────────────────

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
