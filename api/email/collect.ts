// POST /api/email/collect — Store a guest's email address
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { guestId, email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(200).json({ success: true, stored: false, message: 'No database configured' });
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);

    if (guestId && guestId > 0) {
      await sql`UPDATE guests SET email = ${email} WHERE id = ${guestId}`;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email collect error:', error);
    return res.status(500).json({ error: 'Failed to store email' });
  }
}
