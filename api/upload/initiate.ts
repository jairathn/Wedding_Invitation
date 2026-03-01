// POST /api/upload/initiate
//
// Two modes:
//  1. Photo (has `file` field): compressed base64 → upload to Drive in one shot
//  2. Video (has `totalSize` field, no `file`): create folders + start a Drive
//     resumable upload session, return the session URI for chunked upload
//
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
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
    const dbUrl = process.env.DATABASE_URL;

    if (!rootFolderId || !clientId || !clientSecret || !refreshToken) {
      console.error('Missing Google Drive OAuth config');
      return res.status(503).json({
        error: 'Google Drive not configured',
        message: 'Upload could not be saved — the wedding album storage is not set up yet.',
      });
    }

    const { file, metadata, filename, contentType, totalSize } = req.body;
    const meta = (metadata || {}) as Record<string, unknown>;
    const guestName = (meta.guestName as string) || 'Unknown';
    const eventSlug = (meta.eventSlug as string) || 'general';
    const safeName = (filename as string) || 'upload';
    const safeContentType = (contentType as string) || 'application/octet-stream';

    // ── Authenticate with Google Drive via OAuth2 ────────────────────
    const { drive, oauth2Client } = await getDriveClient(clientId, clientSecret, refreshToken);

    // ── Create folder structure ─────────────────────────────────────
    const byGuestFolder = await findOrCreateFolder(drive, 'By Guest', rootFolderId);
    const guestFolder = await findOrCreateFolder(drive, guestName, byGuestFolder);
    const eventFolder = await findOrCreateFolder(drive, eventSlug, guestFolder);

    // ════════════════════════════════════════════════════════════════
    // MODE 1: VIDEO — initiate resumable upload, return session URI
    // ════════════════════════════════════════════════════════════════
    if (!file && totalSize) {
      const { token } = await oauth2Client.getAccessToken();

      const driveRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Type': safeContentType,
            'X-Upload-Content-Length': String(totalSize),
          },
          body: JSON.stringify({
            name: safeName,
            parents: [eventFolder],
          }),
        },
      );

      if (!driveRes.ok) {
        const body = await driveRes.text();
        console.error('Resumable session init failed:', driveRes.status, body);
        return res.status(502).json({ error: 'Failed to start video upload session' });
      }

      const sessionUri = driveRes.headers.get('location');
      if (!sessionUri) {
        return res.status(502).json({ error: 'Google Drive did not return a session URI' });
      }

      return res.status(200).json({
        mode: 'chunked',
        sessionUri,
        eventFolderId: eventFolder,
      });
    }

    // ════════════════════════════════════════════════════════════════
    // MODE 2: PHOTO — single-shot upload
    // ════════════════════════════════════════════════════════════════
    if (!file) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    const fileBuffer = Buffer.from(file as string, 'base64');

    const { Readable } = await import('stream');
    const fileStream = new Readable();
    fileStream.push(fileBuffer);
    fileStream.push(null);

    const driveFile = await drive.files.create({
      requestBody: { name: safeName, parents: [eventFolder] },
      media: { mimeType: safeContentType, body: fileStream },
      fields: 'id, name',
      supportsAllDrives: true,
    });

    // Create shortcut in By Event folder (best-effort)
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
        supportsAllDrives: true,
      });
    } catch (err) {
      console.error('Shortcut creation failed (non-fatal):', err);
    }

    // Record in database (best-effort)
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

    return res.status(200).json({ success: true, driveFileId: driveFile.data.id });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}

// ── Shared helpers ────────────────────────────────────────────────────

async function getDriveClient(clientId: string, clientSecret: string, refreshToken: string) {
  const { google } = await import('googleapis');

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  return { drive, oauth2Client };
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
