// POST /api/auth/register — Register a guest session
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, deviceType, userAgent } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Check if we have a database connection
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      // No database — return a local-only session
      const sessionId = crypto.randomUUID();
      return res.status(200).json({
        id: sessionId,
        guestId: 0,
        guest: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          isOnGuestList: true, // Can't verify without DB
        },
        deviceType: deviceType || 'mobile',
        createdAt: new Date().toISOString(),
      });
    }

    // With database: upsert guest, create session
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);

    // Upsert guest
    const guestRows = await sql`
      INSERT INTO guests (first_name, last_name)
      VALUES (${firstName.trim()}, ${lastName.trim()})
      ON CONFLICT (first_name, last_name) DO UPDATE SET first_name = EXCLUDED.first_name
      RETURNING id, first_name, last_name
    `;
    const guest = guestRows[0];

    // Create session
    const sessionId = crypto.randomUUID();
    await sql`
      INSERT INTO sessions (id, guest_id, device_type, user_agent)
      VALUES (${sessionId}, ${guest.id}, ${deviceType || 'mobile'}, ${userAgent || ''})
    `;

    return res.status(200).json({
      id: sessionId,
      guestId: guest.id,
      guest: {
        id: guest.id,
        firstName: guest.first_name,
        lastName: guest.last_name,
        fullName: `${guest.first_name} ${guest.last_name}`,
        isOnGuestList: true,
      },
      deviceType: deviceType || 'mobile',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
