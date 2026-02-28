// POST /api/upload/retry — Retry failed uploads
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(200).json({ success: true, retried: 0 });
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);

    // Reset failed uploads to pending
    const result = await sql`
      UPDATE uploads
      SET upload_status = 'pending', retry_count = retry_count + 1
      WHERE upload_status = 'failed'
      RETURNING id
    `;

    return res.status(200).json({ success: true, retried: result.length });
  } catch (error) {
    console.error('Retry error:', error);
    return res.status(500).json({ error: 'Failed to retry uploads' });
  }
}
