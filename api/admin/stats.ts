// GET /api/admin/stats — Upload counts, storage used, queue status
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify admin key
  const adminKey = req.headers['x-admin-key'] as string;
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(200).json({
      totalUploads: 0,
      videoCount: 0,
      photoCount: 0,
      pendingUploads: 0,
      failedUploads: 0,
      uniqueGuests: 0,
    });
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);

    const [totals] = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE media_type = 'video') as videos,
        COUNT(*) FILTER (WHERE media_type = 'photo') as photos,
        COUNT(*) FILTER (WHERE upload_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE upload_status = 'failed') as failed,
        COUNT(DISTINCT guest_id) as unique_guests
      FROM uploads
    `;

    return res.status(200).json({
      totalUploads: Number(totals.total),
      videoCount: Number(totals.videos),
      photoCount: Number(totals.photos),
      pendingUploads: Number(totals.pending),
      failedUploads: Number(totals.failed),
      uniqueGuests: Number(totals.unique_guests),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
