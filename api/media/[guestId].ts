// GET /api/media/:guestId — Get all media for a guest
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { guestId } = req.query;
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return res.status(200).json([]);
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);

    const uploads = await sql`
      SELECT id, event, media_type, filename, drive_file_id, upload_status, filter_applied, prompt_answered, created_at
      FROM uploads
      WHERE guest_id = ${Number(guestId)}
      ORDER BY created_at DESC
    `;

    return res.status(200).json(uploads);
  } catch (error) {
    console.error('Media fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch media' });
  }
}
