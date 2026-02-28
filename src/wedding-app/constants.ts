import type { WeddingEvent, FilterConfig } from './types';

// ─── Events ───────────────────────────────────────────────
export const EVENTS: WeddingEvent[] = [
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

// ─── Conversational Prompts ───────────────────────────────
export const PROMPTS = {
  heartfelt: [
    "What's your favorite memory with Neil or Shriya?",
    "What do you love most about seeing them together?",
    "What advice would you give them as they start this journey?",
    "Describe Neil or Shriya in three words.",
    "What's something you hope they never forget?",
    "Tell them something you've never told them before.",
  ],
  fun: [
    "What's the most embarrassing story you have about Neil or Shriya?",
    "If their relationship were a movie, what would it be called?",
    "What's the worst piece of advice you can give them about marriage?",
    "Rate their dance moves on a scale of 1 to 10. Be honest.",
    "Neil thinks he's a great cook. Tell Shriya the truth.",
    "What's the over/under on how many times Neil will cry today?",
    "Predict: What will they be arguing about in 5 years?",
  ],
  quickTakes: [
    "In one sentence, why are Neil and Shriya perfect for each other?",
    "Finish this sentence: 'I knew they were meant to be when...'",
    "Toast! Say cheers and give them one piece of wisdom.",
  ],
};

export function getRandomPrompts(count: number = 3): string[] {
  const all = [...PROMPTS.heartfelt, ...PROMPTS.fun, ...PROMPTS.quickTakes];
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Filters ──────────────────────────────────────────────
export const FILTERS: FilterConfig[] = [
  // Classic / Universal
  {
    id: 'none',
    name: 'No Filter',
    event: 'all',
    thumbnail: '',
    type: 'color',
    cssFilter: 'none',
  },
  {
    id: 'film-grain',
    name: 'Film Grain',
    event: 'all',
    thumbnail: '',
    type: 'color',
    cssFilter: 'saturate(0.9) contrast(1.05) sepia(0.1)',
  },
  {
    id: 'bw-classic',
    name: 'Black & White',
    event: 'all',
    thumbnail: '',
    type: 'color',
    cssFilter: 'grayscale(1) contrast(1.2)',
  },
  {
    id: 'vintage-warmth',
    name: 'Vintage Warmth',
    event: 'all',
    thumbnail: '',
    type: 'color',
    cssFilter: 'sepia(0.3) saturate(1.2) contrast(1.05) brightness(1.05)',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    event: 'all',
    thumbnail: '',
    type: 'color',
    cssFilter: 'sepia(0.2) saturate(1.4) brightness(1.1) contrast(1.05)',
  },

  // Haldi Collection
  {
    id: 'marigold-glow',
    name: 'Marigold Glow',
    event: 'haldi',
    thumbnail: '',
    type: 'combined',
    cssFilter: 'saturate(1.3) sepia(0.15) brightness(1.05)',
    textOverlay: {
      text: '#JayWalkingToJairath  Haldi',
      position: 'bottom',
      font: 'Playfair Display',
      color: '#ffffff',
    },
  },
  {
    id: 'henna-frame',
    name: 'Henna Frame',
    event: 'haldi',
    thumbnail: '',
    type: 'combined',
    cssFilter: 'sepia(0.2) contrast(1.1) saturate(1.1)',
  },
  {
    id: 'bazaar-nights',
    name: 'Bazaar Nights',
    event: 'haldi',
    thumbnail: '',
    type: 'color',
    cssFilter: 'contrast(1.15) saturate(1.3) brightness(1.05)',
  },
  {
    id: 'haldi-splash',
    name: 'Haldi Splash',
    event: 'haldi',
    thumbnail: '',
    type: 'combined',
    cssFilter: 'saturate(1.4) sepia(0.1) brightness(1.08)',
  },

  // Sangeet Collection
  {
    id: 'bollywood-glam',
    name: 'Bollywood Glam',
    event: 'sangeet',
    thumbnail: '',
    type: 'combined',
    cssFilter: 'contrast(1.2) saturate(1.3) hue-rotate(-5deg)',
    textOverlay: {
      text: '#JayWalkingToJairath  Sangeet Night',
      position: 'bottom',
      font: 'Playfair Display',
      color: '#ffffff',
    },
  },
  {
    id: 'stage-lights',
    name: 'Stage Lights',
    event: 'sangeet',
    thumbnail: '',
    type: 'color',
    cssFilter: 'contrast(1.25) brightness(1.05) saturate(1.2)',
  },
  {
    id: 'desi-disco',
    name: 'Desi Disco',
    event: 'sangeet',
    thumbnail: '',
    type: 'color',
    cssFilter: 'saturate(1.5) contrast(1.1) brightness(1.05)',
  },
  {
    id: 'string-lights',
    name: 'String Lights',
    event: 'sangeet',
    thumbnail: '',
    type: 'color',
    cssFilter: 'brightness(1.1) contrast(1.05) saturate(1.15)',
  },

  // Wedding Collection
  {
    id: 'mediterranean-gold',
    name: 'Mediterranean Gold',
    event: 'wedding_reception',
    thumbnail: '',
    type: 'combined',
    cssFilter: 'sepia(0.15) saturate(1.2) brightness(1.08) contrast(1.05)',
    textOverlay: {
      text: '#JayWalkingToJairath ',
      position: 'bottom',
      font: 'Playfair Display',
      color: '#ffffff',
    },
  },
  {
    id: 'mandap-florals',
    name: 'Mandap Florals',
    event: 'wedding_reception',
    thumbnail: '',
    type: 'color',
    cssFilter: 'saturate(1.15) brightness(1.05) sepia(0.08)',
  },
  {
    id: 'barcelona-blue',
    name: 'Barcelona Blue',
    event: 'wedding_reception',
    thumbnail: '',
    type: 'color',
    cssFilter: 'saturate(0.9) contrast(1.15) hue-rotate(10deg) brightness(0.95)',
  },
  {
    id: 'classic-romance',
    name: 'Classic Romance',
    event: 'wedding_reception',
    thumbnail: '',
    type: 'color',
    cssFilter: 'saturate(0.85) brightness(1.1) contrast(0.95) sepia(0.1)',
  },
];

export function getFiltersForEvent(eventSlug: string): FilterConfig[] {
  return FILTERS.filter(f => f.event === 'all' || f.event === eventSlug);
}

// ─── Auto-detect current event by date ────────────────────
export function getCurrentEvent(): WeddingEvent | null {
  const today = new Date().toISOString().split('T')[0];
  return EVENTS.find(e => e.date === today) || null;
}

export function getNextEvent(): WeddingEvent | null {
  const today = new Date().toISOString().split('T')[0];
  return EVENTS.find(e => e.date >= today) || null;
}

// ─── Recording Limits ─────────────────────────────────────
export const MAX_PROMPTED_DURATION = 90; // seconds
export const MAX_FREEFORM_DURATION = 180; // 3 minutes
export const PROMPTS_PER_SESSION = 3;

// ─── Design Tokens ────────────────────────────────────────
export const COLORS = {
  bgPrimary: '#0a0a0a',
  bgSecondary: '#1a1a2e',
  accentGold: '#c9a84c',
  accentBlush: '#d4a0a0',
  textPrimary: '#f5f0e8',
  textSecondary: '#a0998c',
  success: '#7d9b76',
  warning: '#d4a843',
  error: '#c45c5c',
} as const;

// ─── Kiosk ────────────────────────────────────────────────
export const KIOSK_IDLE_TIMEOUT = 60_000; // 60 seconds

// ─── Upload Queue ─────────────────────────────────────────
export const RETRY_DELAYS = [0, 30_000, 60_000, 300_000, 900_000, 1_800_000]; // immediate, 30s, 1m, 5m, 15m, 30m
export const MAX_CONCURRENT_UPLOADS = 2;
