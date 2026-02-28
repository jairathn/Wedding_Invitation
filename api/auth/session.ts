// GET /api/auth/session — Get current session info
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId) {
    return res.status(401).json({ error: 'No session' });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(200).json({ id: sessionId, guest: null });
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);

    const rows = await sql`
      SELECT s.id, s.device_type, s.created_at,
             g.id as guest_id, g.first_name, g.last_name, g.email
      FROM sessions s
      JOIN guests g ON g.id = s.guest_id
      WHERE s.id = ${sessionId}
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const row = rows[0];
    return res.status(200).json({
      id: row.id,
      guestId: row.guest_id,
      guest: {
        id: row.guest_id,
        firstName: row.first_name,
        lastName: row.last_name,
        fullName: `${row.first_name} ${row.last_name}`,
        email: row.email,
      },
      deviceType: row.device_type,
      createdAt: row.created_at,
    });
  } catch (error) {
    console.error('Session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
