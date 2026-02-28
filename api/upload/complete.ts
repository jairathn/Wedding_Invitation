// POST /api/upload/complete — Mark upload as complete
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uploadId, driveFileId } = req.body;
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return res.status(200).json({ success: true });
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);
    await sql`
      UPDATE uploads
      SET upload_status = 'complete', drive_file_id = ${driveFileId || null}, uploaded_at = NOW()
      WHERE id = ${uploadId}
    `;
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Complete error:', error);
    return res.status(500).json({ error: 'Failed to mark upload complete' });
  }
}
