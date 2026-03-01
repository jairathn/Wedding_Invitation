// POST /api/upload/initiate — Handle file upload, store in Google Drive
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: false, // Handle multipart form data manually
  },
};

// Parse multipart form data (simplified for Vercel)
async function parseFormData(req: VercelRequest): Promise<{ file: Buffer; metadata: Record<string, unknown>; filename: string; contentType: string }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';

      // Try to parse as JSON with base64 file
      if (contentType.includes('application/json')) {
        try {
          const json = JSON.parse(body.toString());
          resolve({
            file: Buffer.from(json.file, 'base64'),
            metadata: json.metadata || {},
            filename: json.filename || 'upload',
            contentType: json.contentType || 'application/octet-stream',
          });
        } catch (e) {
          reject(e);
        }
        return;
      }

      // For multipart, extract the file from the raw body
      // This is a simplified parser — in production, use a library like busboy
      resolve({
        file: body,
        metadata: {},
        filename: 'upload',
        contentType: 'application/octet-stream',
      });
    });
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    const dbUrl = process.env.DATABASE_URL;

    if (!serviceAccountKey || !rootFolderId) {
      console.error('Google Drive not configured. GOOGLE_SERVICE_ACCOUNT_KEY and GOOGLE_DRIVE_ROOT_FOLDER_ID must be set.');
      return res.status(503).json({
        error: 'Google Drive not configured',
        message: 'Upload could not be saved — the wedding album storage is not set up yet. Please contact the couple.',
      });
    }

    // Google Drive upload logic
    const { google } = await import('googleapis');
    const credentials = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString());
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const { file, metadata, filename, contentType } = await parseFormData(req);
    const guestName = (metadata as { guestName?: string }).guestName || 'Unknown';
    const eventSlug = (metadata as { eventSlug?: string }).eventSlug || 'general';

    // Ensure folder structure exists
    // By Guest / {guestName} / {eventSlug}
    const byGuestFolder = await findOrCreateFolder(drive, 'By Guest', rootFolderId);
    const guestFolder = await findOrCreateFolder(drive, guestName, byGuestFolder);
    const eventFolder = await findOrCreateFolder(drive, eventSlug, guestFolder);

    // Upload file
    const { Readable } = await import('stream');
    const fileStream = new Readable();
    fileStream.push(file);
    fileStream.push(null);

    const driveFile = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [eventFolder],
      },
      media: {
        mimeType: contentType,
        body: fileStream,
      },
      fields: 'id, name',
    });

    // Create shortcut in By Event folder
    const byEventFolder = await findOrCreateFolder(drive, 'By Event', rootFolderId);
    const eventDateFolder = await findOrCreateFolder(drive, eventSlug, byEventFolder);
    await drive.files.create({
      requestBody: {
        name: filename,
        mimeType: 'application/vnd.google-apps.shortcut',
        shortcutDetails: {
          targetId: driveFile.data.id!,
        },
        parents: [eventDateFolder],
      },
    });

    // Record in database
    if (dbUrl) {
      try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(dbUrl);
        const uploadId = crypto.randomUUID();
        const meta = metadata as { guestId?: number; eventSlug?: string; mediaType?: string; filterApplied?: string; promptAnswered?: string };
        await sql`
          INSERT INTO uploads (id, guest_id, event, media_type, filename, drive_file_id, drive_folder_id, upload_status, uploaded_at, filter_applied, prompt_answered)
          VALUES (${uploadId}, ${meta.guestId || 0}, ${meta.eventSlug || 'unknown'}, ${meta.mediaType || 'photo'}, ${filename}, ${driveFile.data.id}, ${eventFolder}, ${'complete'}, ${new Date().toISOString()}, ${meta.filterApplied || null}, ${meta.promptAnswered || null})
        `;
      } catch (dbErr) {
        console.error('DB error:', dbErr);
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

// Helper: find or create a folder in Google Drive
async function findOrCreateFolder(drive: any, name: string, parentId: string): Promise<string> {
  // Search for existing folder
  const search = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  });

  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id;
  }

  // Create new folder
  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });

  return folder.data.id;
}
