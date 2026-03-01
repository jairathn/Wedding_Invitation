// GET /api/admin/:action — Unified admin endpoint
// Handles both /api/admin/health and /api/admin/stats
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

  const { action } = req.query;

  if (action === 'health') {
    return handleHealth(req, res);
  }
  if (action === 'stats') {
    return handleStats(req, res);
  }

  return res.status(404).json({ error: 'Unknown admin action' });
}

async function handleHealth(_req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, string> = {
    server: 'ok',
    database: 'not configured',
    googleDrive: 'not configured',
  };

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(dbUrl);
      await sql`SELECT 1`;
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID) {
    checks.googleDrive = 'configured';
  }

  const allOk = Object.values(checks).every(v => v === 'ok' || v === 'configured' || v === 'not configured');

  return res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
}

async function handleStats(_req: VercelRequest, res: VercelResponse) {
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
