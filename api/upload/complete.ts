// POST /api/upload/complete — After the client uploads directly to GCS,
// this endpoint streams the file from GCS → Google Drive, creates the
// folder structure, and records in the database.
//
// Uses fetch for GCS operations (no @google-cloud/storage needed).
//
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    const bucketName = process.env.GCS_BUCKET_NAME;
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
    const dbUrl = process.env.DATABASE_URL;

    if (!serviceAccountKey || !rootFolderId || !bucketName || !clientId || !clientSecret || !refreshToken) {
      return res.status(503).json({ error: 'Storage not configured' });
    }

    const { objectPath, filename, contentType, metadata } = req.body;
    const meta = (metadata || {}) as Record<string, unknown>;
    const guestName = (meta.guestName as string) || 'Unknown';
    const eventSlug = (meta.eventSlug as string) || 'general';
    const safeName = (filename as string) || 'upload';
    const safeContentType = (contentType as string) || 'application/octet-stream';

    const credentials = parseCredentials(serviceAccountKey);

    // ── Get a GCS access token via service account JWT ───────────────
    const { google } = await import('googleapis');
    const saAuth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/devstorage.read_write'],
    });
    const saClient = await saAuth.getClient();
    const { token: gcsToken } = await saClient.getAccessToken();

    // ── Set up Drive client (OAuth2 — uploads as you) ────────────────
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // ── Create Drive folder structure: Root / {Guest} / {Event} ──────
    const guestFolder = await findOrCreateFolder(drive, guestName, rootFolderId);
    const eventFolder = await findOrCreateFolder(drive, eventSlug, guestFolder);

    // ── Download from GCS via REST API ───────────────────────────────
    const encodedObject = encodeURIComponent(objectPath as string);
    const gcsUrl = `https://storage.googleapis.com/storage/v1/b/${bucketName}/o/${encodedObject}?alt=media`;
    const gcsRes = await fetch(gcsUrl, {
      headers: { Authorization: `Bearer ${gcsToken}` },
    });

    if (!gcsRes.ok) {
      const body = await gcsRes.text();
      console.error('GCS download failed:', gcsRes.status, body);
      return res.status(502).json({ error: 'Failed to read file from GCS' });
    }

    // ── Upload to Drive ──────────────────────────────────────────────
    const { Readable } = await import('stream');
    const gcsBuffer = Buffer.from(await gcsRes.arrayBuffer());
    const gcsStream = new Readable();
    gcsStream.push(gcsBuffer);
    gcsStream.push(null);

    const driveFile = await drive.files.create({
      requestBody: { name: safeName, parents: [eventFolder] },
      media: { mimeType: safeContentType, body: gcsStream },
      fields: 'id, name',
      supportsAllDrives: true,
    });

    // ── Record in database (best-effort) ─────────────────────────────
    if (dbUrl) {
      try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(dbUrl);
        const uploadId = crypto.randomUUID();
        await sql`
          INSERT INTO uploads (id, guest_id, event, media_type, filename, drive_file_id, drive_folder_id, upload_status, uploaded_at, filter_applied, prompt_answered)
          VALUES (${uploadId}, ${(meta.guestId as number) || 0}, ${eventSlug}, ${(meta.mediaType as string) || 'photo'}, ${safeName}, ${driveFile.data.id}, ${eventFolder}, ${'complete'}, ${new Date().toISOString()}, ${(meta.filterApplied as string) || null}, ${(meta.promptAnswered as string) || null})
        `;
      } catch (dbErr) {
        console.error('DB record failed (non-fatal):', dbErr);
      }
    }

    // ── Clean up GCS (best-effort) ───────────────────────────────────
    try {
      const deleteUrl = `https://storage.googleapis.com/storage/v1/b/${bucketName}/o/${encodedObject}`;
      await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${gcsToken}` },
      });
    } catch (err) {
      console.error('GCS cleanup failed (non-fatal):', err);
    }

    return res.status(200).json({
      success: true,
      driveFileId: driveFile.data.id,
    });
  } catch (error) {
    console.error('Complete error:', error);
    return res.status(500).json({ error: 'Failed to transfer file to Drive' });
  }
}

// ── Shared helpers ────────────────────────────────────────────────────

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

async function findOrCreateFolder(drive: any, name: string, parentId: string): Promise<string> {
  const escapedName = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const search = await drive.files.list({
    q: `name='${escapedName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });
  if (search.data.files?.length) return search.data.files[0].id;
  const folder = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
    fields: 'id',
    supportsAllDrives: true,
  });
  return folder.data.id;
}
