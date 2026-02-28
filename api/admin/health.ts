// GET /api/admin/health — System health check
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

  const checks: Record<string, string> = {
    server: 'ok',
    database: 'not configured',
    googleDrive: 'not configured',
  };

  // Check database
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

  // Check Google Drive credentials
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
