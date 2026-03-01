// POST /api/upload/complete — Record a completed upload in the database.
//
// The file is already in Google Drive (uploaded directly via resumable
// upload).  This endpoint just creates the database record.
//
// Request:  { driveFileId, folderId, filename, contentType, metadata }
//
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      // No database configured — that's fine, upload still succeeded
      return res.status(200).json({ success: true, recorded: false });
    }

    const { driveFileId, folderId, filename, metadata } = req.body;
    const meta = (metadata || {}) as Record<string, unknown>;
    const eventSlug = (meta.eventSlug as string) || 'general';
    const safeName = (filename as string) || 'upload';

    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);
    const uploadId = crypto.randomUUID();

    await sql`
      INSERT INTO uploads (id, guest_id, event, media_type, filename, drive_file_id, drive_folder_id, upload_status, uploaded_at, filter_applied, prompt_answered)
      VALUES (
        ${uploadId},
        ${(meta.guestId as number) || 0},
        ${eventSlug},
        ${(meta.mediaType as string) || 'photo'},
        ${safeName},
        ${driveFileId || null},
        ${folderId || null},
        ${'complete'},
        ${new Date().toISOString()},
        ${(meta.filterApplied as string) || null},
        ${(meta.promptAnswered as string) || null}
      )
    `;

    return res.status(200).json({ success: true, recorded: true });
  } catch (error) {
    console.error('Complete error:', error);
    // Don't fail the whole upload just because DB recording failed
    return res.status(200).json({ success: true, recorded: false, error: 'DB record failed' });
  }
}
