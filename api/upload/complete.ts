// POST /api/upload/complete — After the client uploads directly to Google
// Drive, this endpoint creates the By-Event shortcut and records the upload
// in the database.
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    driveFileId,
    eventFolderId,
    filename,
    eventSlug,
    guestId,
    mediaType,
    filterApplied,
    promptAnswered,
  } = req.body;

  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  const dbUrl = process.env.DATABASE_URL;

  // ── Create "By Event" shortcut (best-effort) ───────────────────────
  if (serviceAccountKey && rootFolderId && driveFileId) {
    try {
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

      const safeEvent = (eventSlug as string) || 'general';
      const byEventFolder = await findOrCreateFolder(drive, 'By Event', rootFolderId);
      const eventDateFolder = await findOrCreateFolder(drive, safeEvent, byEventFolder);

      await drive.files.create({
        requestBody: {
          name: (filename as string) || 'upload',
          mimeType: 'application/vnd.google-apps.shortcut',
          shortcutDetails: { targetId: driveFileId as string },
          parents: [eventDateFolder],
        },
      });
    } catch (err) {
      // Non-fatal — file is already uploaded, shortcut is a nice-to-have
      console.error('Shortcut creation failed:', err);
    }
  }

  // ── Record in database (best-effort) ──────────────────────────────
  if (dbUrl) {
    try {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(dbUrl);
      const uploadId = crypto.randomUUID();
      await sql`
        INSERT INTO uploads (id, guest_id, event, media_type, filename, drive_file_id, drive_folder_id, upload_status, uploaded_at, filter_applied, prompt_answered)
        VALUES (${uploadId}, ${(guestId as number) || 0}, ${(eventSlug as string) || 'unknown'}, ${(mediaType as string) || 'photo'}, ${(filename as string) || 'upload'}, ${driveFileId || null}, ${eventFolderId || null}, ${'complete'}, ${new Date().toISOString()}, ${filterApplied || null}, ${promptAnswered || null})
      `;
    } catch (dbErr) {
      console.error('DB record failed:', dbErr);
    }
  }

  return res.status(200).json({ success: true });
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
