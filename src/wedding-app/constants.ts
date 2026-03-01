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

// ─── Categorized Filter UI (for photo booth carousel) ────
export interface FilterCategory {
  label: string;
  filters: {
    id: string;
    name: string;
    preview: string; // CSS gradient for the swatch circle
    cssFilter: string;
    textOverlay?: FilterConfig['textOverlay'];
  }[];
}

export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    label: 'Classic',
    filters: [
      { id: 'none', name: 'No Filter', preview: 'linear-gradient(135deg, #e8e0d4 0%, #d4ccc0 100%)', cssFilter: 'none' },
      { id: 'film', name: 'Film', preview: 'linear-gradient(135deg, #c9b896 0%, #a89878 100%)', cssFilter: 'saturate(0.9) contrast(1.05) sepia(0.1)' },
      { id: 'bw', name: 'B&W', preview: 'linear-gradient(135deg, #888 0%, #555 100%)', cssFilter: 'grayscale(1) contrast(1.2)' },
      { id: 'vintage', name: 'Vintage', preview: 'linear-gradient(135deg, #c4a882 0%, #9e8468 100%)', cssFilter: 'sepia(0.3) saturate(1.2) contrast(1.05) brightness(1.05)' },
      { id: 'golden', name: 'Golden Hr', preview: 'linear-gradient(135deg, #d4a853 0%, #b8923e 100%)', cssFilter: 'sepia(0.2) saturate(1.4) brightness(1.1) contrast(1.05)' },
    ],
  },
  {
    label: 'Haldi \u2728',
    filters: [
      { id: 'marigold', name: 'Marigold', preview: 'linear-gradient(135deg, #e8b84d 0%, #d4a030 100%)', cssFilter: 'saturate(1.3) sepia(0.15) brightness(1.05)', textOverlay: { text: '#JayWalkingToJairath  Haldi', position: 'bottom', font: 'Playfair Display', color: '#ffffff' } },
      { id: 'henna', name: 'Henna', preview: 'linear-gradient(135deg, #c4704b 0%, #a05a38 100%)', cssFilter: 'sepia(0.2) contrast(1.1) saturate(1.1)' },
      { id: 'bazaar', name: 'Bazaar', preview: 'linear-gradient(135deg, #e8865a 0%, #c46e44 100%)', cssFilter: 'contrast(1.15) saturate(1.3) brightness(1.05)' },
      { id: 'turmeric', name: 'Turmeric', preview: 'linear-gradient(135deg, #ddc040 0%, #c4a830 100%)', cssFilter: 'saturate(1.4) sepia(0.1) brightness(1.08)' },
    ],
  },
  {
    label: 'Sangeet \uD83C\uDFA4',
    filters: [
      { id: 'bollywood', name: 'Bollywood', preview: 'linear-gradient(135deg, #e84870 0%, #c43058 100%)', cssFilter: 'contrast(1.2) saturate(1.3) hue-rotate(-5deg)', textOverlay: { text: '#JayWalkingToJairath  Sangeet Night', position: 'bottom', font: 'Playfair Display', color: '#ffffff' } },
      { id: 'stage', name: 'Stage', preview: 'linear-gradient(135deg, #8844aa 0%, #6a2d8e 100%)', cssFilter: 'contrast(1.25) brightness(1.05) saturate(1.2)' },
      { id: 'disco', name: 'Disco', preview: 'linear-gradient(135deg, #e8865a 0%, #d46840 100%)', cssFilter: 'saturate(1.5) contrast(1.1) brightness(1.05)' },
      { id: 'strings', name: 'Lights', preview: 'linear-gradient(135deg, #d4a853 0%, #e8c878 100%)', cssFilter: 'brightness(1.1) contrast(1.05) saturate(1.15)' },
    ],
  },
  {
    label: 'Wedding \uD83D\uDC8D',
    filters: [
      { id: 'mediterranean', name: 'Barcelona', preview: 'linear-gradient(135deg, #2b5f8a 0%, #1a4a70 100%)', cssFilter: 'saturate(0.9) contrast(1.15) hue-rotate(10deg) brightness(0.95)', textOverlay: { text: '#JayWalkingToJairath', position: 'bottom', font: 'Playfair Display', color: '#ffffff' } },
      { id: 'mandap', name: 'Mandap', preview: 'linear-gradient(135deg, #c48da0 0%, #a06e80 100%)', cssFilter: 'saturate(1.15) brightness(1.05) sepia(0.08)' },
      { id: 'romance', name: 'Romance', preview: 'linear-gradient(135deg, #e8c4b8 0%, #d4a898 100%)', cssFilter: 'saturate(0.85) brightness(1.1) contrast(0.95) sepia(0.1)' },
      { id: 'starry', name: 'Starry', preview: 'linear-gradient(135deg, #1a2040 0%, #2a3060 100%)', cssFilter: 'sepia(0.15) saturate(1.2) brightness(1.08) contrast(1.05)' },
    ],
  },
];

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
  bgPrimary: '#FEFCF9',      // Warm white
  bgSecondary: '#F7F3ED',    // Soft cream
  cardSurface: '#FFFFFF',    // Pure white cards
  terracotta: '#C4704B',     // Primary accent
  medBlue: '#2B5F8A',        // Secondary accent
  olive: '#7A8B5C',          // Success / nature
  golden: '#D4A853',         // Highlights
  blush: '#E8C4B8',          // Haldi accent
  sunset: '#E8865A',         // Sangeet accent
  textPrimary: '#2C2825',    // Warm charcoal
  textSecondary: '#8A8078',  // Soft brown
  textTertiary: '#B8AFA6',   // Light taupe
  success: '#7A8B5C',        // Olive green
  warning: '#D4A853',        // Golden hour
  error: '#D4726A',          // Soft coral
} as const;

// ─── Kiosk ────────────────────────────────────────────────
export const KIOSK_IDLE_TIMEOUT = 60_000; // 60 seconds

// ─── Upload Queue ─────────────────────────────────────────
export const RETRY_DELAYS = [0, 30_000, 60_000, 300_000, 900_000, 1_800_000]; // immediate, 30s, 1m, 5m, 15m, 30m
export const MAX_CONCURRENT_UPLOADS = 2;
