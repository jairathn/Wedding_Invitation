// GET /api/guests — Get guest directory (names only)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read from the existing guest list JSON
    const guestFilePath = join(process.cwd(), 'src', 'data', 'guests.json');
    const raw = readFileSync(guestFilePath, 'utf-8');
    const data = JSON.parse(raw);

    const guests = data.guests.map((name: string) => {
      const parts = name.trim().split(/\s+/);
      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
        fullName: name,
      };
    });

    return res.status(200).json(guests);
  } catch (error) {
    console.error('Guest list error:', error);
    return res.status(500).json({ error: 'Failed to load guest list' });
  }
}
