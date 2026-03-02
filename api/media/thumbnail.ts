// GET /api/media/thumbnail?id=DRIVE_FILE_ID — Proxy Google Drive file as image
// Authenticates with Google Drive OAuth and streams the file back to the client.
// This is needed because Drive files are private (not publicly shared).

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 15,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const fileId = req.query.id as string;
  if (!fileId) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(503).json({ error: 'Google Drive not configured' });
  }

  try {
    const { google } = await import('googleapis');
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Get the file content from Google Drive
    const response = await drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'arraybuffer' },
    );

    const buffer = Buffer.from(response.data as ArrayBuffer);
    const contentType = response.headers['content-type'] || 'image/jpeg';

    // Cache for 1 hour — thumbnails don't change
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600, immutable');
    return res.status(200).send(buffer);
  } catch (error: unknown) {
    console.error('Thumbnail fetch error:', error instanceof Error ? error.message : error);
    return res.status(404).json({ error: 'File not found' });
  }
}
