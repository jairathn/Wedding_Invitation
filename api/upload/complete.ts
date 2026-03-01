// POST /api/upload/complete — After the client uploads directly to GCS,
// this endpoint streams the file from GCS → Google Drive, creates the
// folder structure + By-Event shortcut, and records in the database.
//
// Request:
//   { objectPath, filename, contentType, metadata }
//
// The GCS → Drive transfer is server-to-server (no CORS, no size limits).
//
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  // Allow up to 60s for large video transfers (GCS → Drive).
  // Vercel Hobby = 10s max, Pro = 60s max.
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
    const dbUrl = process.env.DATABASE_URL;

    if (!serviceAccountKey || !rootFolderId || !bucketName) {
      return res.status(503).json({ error: 'Storage not configured' });
    }

    const { objectPath, filename, contentType, metadata } = req.body;
    const meta = (metadata || {}) as Record<string, unknown>;
    const guestName = (meta.guestName as string) || 'Unknown';
    const eventSlug = (meta.eventSlug as string) || 'general';
    const safeName = (filename as string) || 'upload';
    const safeContentType = (contentType as string) || 'application/octet-stream';

    const credentials = parseCredentials(serviceAccountKey);

    // ── Set up GCS client ───────────────────────────────────────────
    const { Storage } = await import('@google-cloud/storage');
    const storage = new Storage({
      credentials: {
        client_email: credentials.client_email as string,
        private_key: credentials.private_key as string,
      },
      projectId: credentials.project_id as string,
    });

    // ── Set up Drive client ─────────────────────────────────────────
    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // ── Create Drive folder structure ───────────────────────────────
    const byGuestFolder = await findOrCreateFolder(drive, 'By Guest', rootFolderId);
    const guestFolder = await findOrCreateFolder(drive, guestName, byGuestFolder);
    const eventFolder = await findOrCreateFolder(drive, eventSlug, guestFolder);

    // ── Stream from GCS → Drive ─────────────────────────────────────
    const gcsFile = storage.bucket(bucketName).file(objectPath as string);
    const gcsStream = gcsFile.createReadStream();

    const driveFile = await drive.files.create({
      requestBody: { name: safeName, parents: [eventFolder] },
      media: { mimeType: safeContentType, body: gcsStream },
      fields: 'id, name',
    });

    // ── Create By-Event shortcut (best-effort) ──────────────────────
    try {
      const byEventFolder = await findOrCreateFolder(drive, 'By Event', rootFolderId);
      const eventDateFolder = await findOrCreateFolder(drive, eventSlug, byEventFolder);
      await drive.files.create({
        requestBody: {
          name: safeName,
          mimeType: 'application/vnd.google-apps.shortcut',
          shortcutDetails: { targetId: driveFile.data.id! },
          parents: [eventDateFolder],
        },
      });
    } catch (err) {
      console.error('Shortcut creation failed (non-fatal):', err);
    }

    // ── Record in database (best-effort) ────────────────────────────
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

    // ── Clean up GCS (best-effort) ──────────────────────────────────
    try {
      await gcsFile.delete();
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
  });
  if (search.data.files?.length) return search.data.files[0].id;
  const folder = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
    fields: 'id',
  });
  return folder.data.id;
}
