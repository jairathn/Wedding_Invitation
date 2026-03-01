// POST /api/upload/initiate — Accept compressed file + metadata, upload to
// Google Drive.  Photos are compressed client-side (~200-500 KB) so they
// fit comfortably within Vercel's 4.5 MB request body limit.
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    const dbUrl = process.env.DATABASE_URL;

    if (!serviceAccountKey || !rootFolderId) {
      console.error('Missing GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_DRIVE_ROOT_FOLDER_ID');
      return res.status(503).json({
        error: 'Google Drive not configured',
        message: 'Upload could not be saved — the wedding album storage is not set up yet.',
      });
    }

    const { file, metadata, filename, contentType } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    const fileBuffer = Buffer.from(file, 'base64');
    const meta = (metadata || {}) as Record<string, unknown>;
    const guestName = (meta.guestName as string) || 'Unknown';
    const eventSlug = (meta.eventSlug as string) || 'general';
    const safeName = filename || 'upload';
    const safeContentType = contentType || 'application/octet-stream';

    // ── Authenticate with Google Drive ──────────────────────────────
    const { google } = await import('googleapis');

    const trimmed = serviceAccountKey.trim();
    const credentialsJson = trimmed.startsWith('{')
      ? trimmed
      : Buffer.from(trimmed, 'base64').toString('utf-8');

    let credentials: Record<string, unknown>;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch {
      const fixed = credentialsJson.replace(
        /("private_key"\s*:\s*")([^"]*)/,
        (_m, pre, val) => pre + val.replace(/\n/g, '\\n').replace(/\r/g, ''),
      );
      credentials = JSON.parse(fixed);
    }
    if (typeof credentials.private_key === 'string') {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // ── Create folder structure ─────────────────────────────────────
    const byGuestFolder = await findOrCreateFolder(drive, 'By Guest', rootFolderId);
    const guestFolder = await findOrCreateFolder(drive, guestName, byGuestFolder);
    const eventFolder = await findOrCreateFolder(drive, eventSlug, guestFolder);

    // ── Upload file ─────────────────────────────────────────────────
    const { Readable } = await import('stream');
    const fileStream = new Readable();
    fileStream.push(fileBuffer);
    fileStream.push(null);

    const driveFile = await drive.files.create({
      requestBody: {
        name: safeName,
        parents: [eventFolder],
      },
      media: {
        mimeType: safeContentType,
        body: fileStream,
      },
      fields: 'id, name',
    });

    // ── Create shortcut in By Event folder ──────────────────────────
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

    // ── Record in database ──────────────────────────────────────────
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

    return res.status(200).json({
      success: true,
      driveFileId: driveFile.data.id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────

async function findOrCreateFolder(drive: any, name: string, parentId: string): Promise<string> {
  const escapedName = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const search = await drive.files.list({
    q: `name='${escapedName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  });

  if (search.data.files?.length) {
    return search.data.files[0].id;
  }

  const folder = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
    fields: 'id',
  });
  return folder.data.id;
}
