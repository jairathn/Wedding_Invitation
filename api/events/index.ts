// GET /api/events — Get all events with schedule info
import type { VercelRequest, VercelResponse } from '@vercel/node';

const EVENTS = [
  {
    slug: 'haldi',
    name: 'Haldi (Pithi)',
    date: '2026-09-09',
    venueName: 'Hotel Estela',
    description: 'A joyful ceremony of turmeric blessings and celebration.',
    sortOrder: 1,
  },
  {
    slug: 'sangeet',
    name: 'Sangeet',
    date: '2026-09-10',
    venueName: 'Xalet',
    description: 'An evening of music, dance, and Bollywood glamour.',
    sortOrder: 2,
  },
  {
    slug: 'wedding_reception',
    name: 'Wedding Ceremony & Reception',
    date: '2026-09-11',
    venueName: 'TBD',
    description: 'The main event — ceremony, celebration, and dancing into the night.',
    sortOrder: 3,
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(200).json(EVENTS);
}
