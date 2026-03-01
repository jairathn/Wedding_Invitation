// POST /api/upload/initiate
//
// Two modes:
//  1. Photo (has `file` field): compressed base64 → upload to Drive in one shot
//  2. Video (has `totalSize` field, no `file`): create folders + start a Drive
//     resumable upload session, return the session URI for chunked upload
//
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
  maxDuration: 60,
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

    const missing = [
      !rootFolderId && 'GOOGLE_DRIVE_ROOT_FOLDER_ID',
      !clientId && 'GOOGLE_OAUTH_CLIENT_ID',
      !clientSecret && 'GOOGLE_OAUTH_CLIENT_SECRET',
      !refreshToken && 'GOOGLE_OAUTH_REFRESH_TOKEN',
    ].filter(Boolean);

    if (missing.length) {
      console.error('[upload/initiate] Missing env vars:', missing.join(', '));
      return res.status(503).json({
        error: 'Google Drive not configured',
        detail: `Missing: ${missing.join(', ')}`,
        message: 'Upload could not be saved — the wedding album storage is not set up yet.',
      });
    }

    const { file, metadata, filename, contentType, totalSize } = req.body;
    const meta = (metadata || {}) as Record<string, unknown>;
    const guestName = (meta.guestName as string) || 'Unknown';
    const eventSlug = (meta.eventSlug as string) || 'general';
    const safeName = (filename as string) || 'upload';
    const safeContentType = (contentType as string) || 'application/octet-stream';

    const fileSize = file ? Buffer.byteLength(file as string, 'utf8') : 0;
    console.log(`[upload/initiate] guest="${guestName}" event="${eventSlug}" file="${safeName}" type="${safeContentType}" base64Bytes=${fileSize} totalSize=${totalSize || 'n/a'}`);

    // ── Authenticate with Google Drive via OAuth2 ────────────────────
    console.log('[upload/initiate] Authenticating with Google Drive...');
    const { drive, oauth2Client } = await getDriveClient(clientId, clientSecret, refreshToken);

    // ── Create folder structure: Wedding Media / {Guest} / {Event} ──
    console.log(`[upload/initiate] Finding/creating folders: root/${guestName}/${eventSlug}`);
    const guestFolder = await findOrCreateFolder(drive, guestName, rootFolderId);
    const eventFolder = await findOrCreateFolder(drive, eventSlug, guestFolder);
    console.log(`[upload/initiate] Folders ready: guest=${guestFolder} event=${eventFolder}`);

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
        console.error(`[upload/initiate] Resumable session failed: ${driveRes.status}`, body);
        return res.status(502).json({ error: 'Failed to start video upload session', detail: body });
      }

      const sessionUri = driveRes.headers.get('location');
      if (!sessionUri) {
        console.error('[upload/initiate] No session URI in Drive response headers');
        return res.status(502).json({ error: 'Google Drive did not return a session URI' });
      }

      console.log(`[upload/initiate] Resumable session created for "${safeName}"`);
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
      console.error('[upload/initiate] No file data and no totalSize — nothing to upload');
      return res.status(400).json({ error: 'Missing file data' });
    }

    const fileBuffer = Buffer.from(file as string, 'base64');
    console.log(`[upload/initiate] Decoded file: ${(fileBuffer.length / 1024).toFixed(1)} KB`);

    const { Readable } = await import('stream');
    const fileStream = new Readable();
    fileStream.push(fileBuffer);
    fileStream.push(null);

    console.log(`[upload/initiate] Uploading "${safeName}" to Google Drive...`);
    const driveFile = await drive.files.create({
      requestBody: { name: safeName, parents: [eventFolder] },
      media: { mimeType: safeContentType, body: fileStream },
      fields: 'id, name',
      supportsAllDrives: true,
    });
    console.log(`[upload/initiate] Drive upload complete: fileId=${driveFile.data.id} name="${driveFile.data.name}"`);

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
        console.log(`[upload/initiate] DB record created: ${uploadId}`);
      } catch (dbErr) {
        console.error('[upload/initiate] DB record failed (non-fatal):', dbErr);
      }
    } else {
      console.log('[upload/initiate] No DATABASE_URL — skipping DB record');
    }

    return res.status(200).json({ success: true, driveFileId: driveFile.data.id });
  } catch (error: any) {
    const detail = error?.response?.data || error?.message || String(error);
    console.error('[upload/initiate] Upload failed:', detail);
    return res.status(500).json({ error: 'Upload failed', detail: typeof detail === 'string' ? detail : JSON.stringify(detail) });
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
