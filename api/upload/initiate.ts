// POST /api/upload/initiate — Create Drive folder structure and return a
// resumable upload URL.  The client uploads the file directly to Google
// Drive, bypassing Vercel's 4.5 MB body-size limit entirely.
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    if (!serviceAccountKey || !rootFolderId) {
      console.error('Missing GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_DRIVE_ROOT_FOLDER_ID');
      return res.status(503).json({
        error: 'Google Drive not configured',
        message: 'Upload could not be saved — the wedding album storage is not set up yet.',
      });
    }

    const { filename, contentType, guestName, eventSlug } = req.body;

    const { google } = await import('googleapis');

    // ── Parse service account key (base64 or raw JSON) ──────────────
    const trimmed = serviceAccountKey.trim();
    const credentialsJson = trimmed.startsWith('{')
      ? trimmed
      : Buffer.from(trimmed, 'base64').toString('utf-8');

    let credentials: Record<string, unknown>;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch {
      // Literal newlines inside private_key break JSON.parse — fix them.
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
    const safeName = (guestName as string) || 'Unknown';
    const safeEvent = (eventSlug as string) || 'general';

    const byGuestFolder = await findOrCreateFolder(drive, 'By Guest', rootFolderId);
    const guestFolder = await findOrCreateFolder(drive, safeName, byGuestFolder);
    const eventFolder = await findOrCreateFolder(drive, safeEvent, guestFolder);

    // ── Initiate resumable upload session ───────────────────────────
    const authClient = await auth.getClient();
    const { token } = await authClient.getAccessToken();

    // Derive client origin so Google sets the right CORS headers
    const origin = req.headers.origin
      || (req.headers.referer ? new URL(req.headers.referer as string).origin : undefined)
      || `https://${req.headers.host}`;

    const driveRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&origin=${encodeURIComponent(origin)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': (contentType as string) || 'application/octet-stream',
        },
        body: JSON.stringify({
          name: (filename as string) || 'upload',
          parents: [eventFolder],
        }),
      },
    );

    if (!driveRes.ok) {
      const body = await driveRes.text();
      console.error('Resumable upload init failed:', driveRes.status, body);
      return res.status(502).json({ error: 'Failed to initiate upload with Google Drive' });
    }

    const uploadUrl = driveRes.headers.get('location');
    if (!uploadUrl) {
      return res.status(502).json({ error: 'Google Drive did not return an upload URL' });
    }

    return res.status(200).json({
      uploadUrl,
      eventFolderId: eventFolder,
    });
  } catch (error) {
    console.error('Upload initiate error:', error);
    return res.status(500).json({ error: 'Failed to initiate upload' });
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
