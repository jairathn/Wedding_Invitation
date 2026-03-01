// POST /api/upload/sign — Initiate a Google Drive resumable upload.
//
// Creates the folder structure (Root / Guest / Event) then starts a
// resumable upload session.  Returns the session URI to the client,
// which PUTs file data directly to googleapis.com (CORS built-in).
//
// No GCS bucket, no signed URLs, no CORS config needed.
//
// Request:  { filename, contentType, metadata }
// Response: { signedUrl, objectPath, folderId }
//
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    if (!clientId || !clientSecret || !refreshToken || !rootFolderId) {
      return res.status(503).json({
        error: 'Drive not configured',
        message: 'GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN, and GOOGLE_DRIVE_ROOT_FOLDER_ID must be set.',
      });
    }

    const { filename, contentType, metadata } = req.body;
    const meta = (metadata || {}) as Record<string, unknown>;
    const guestName = (meta.guestName as string) || 'Unknown';
    const eventSlug = (meta.eventSlug as string) || 'general';
    const safeContentType = (contentType as string) || 'application/octet-stream';
    const safeName = (filename as string) || 'upload';

    // ── Authenticate ─────────────────────────────────────────────────
    const { google } = await import('googleapis');
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // ── Create folder structure: Root / {Guest} / {Event} ────────────
    const guestFolder = await findOrCreateFolder(drive, guestName, rootFolderId);
    const eventFolder = await findOrCreateFolder(drive, eventSlug, guestFolder);

    // ── Initiate resumable upload to Drive ────────────────────────────
    const { token } = await oauth2Client.getAccessToken();

    const initRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': safeContentType,
        },
        body: JSON.stringify({
          name: safeName,
          parents: [eventFolder],
        }),
      },
    );

    if (!initRes.ok) {
      const body = await initRes.text();
      console.error('Drive resumable init failed:', initRes.status, body);
      return res.status(502).json({ error: 'Failed to initiate upload', detail: body });
    }

    const signedUrl = initRes.headers.get('Location');
    if (!signedUrl) {
      console.error('Drive resumable init: no Location header');
      return res.status(502).json({ error: 'Drive did not return upload URI' });
    }

    return res.status(200).json({
      signedUrl,
      objectPath: `drive/${eventFolder}/${safeName}`,
      folderId: eventFolder,
    });
  } catch (error) {
    console.error('Sign URL error:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

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
