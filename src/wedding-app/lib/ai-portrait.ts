// AI Portrait system — style definitions, API helpers, and rate limiting
// Uses OpenAI gpt-image-1.5 for identity-preserving style transfer

export interface AIPortraitStyle {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  gradient: string;         // CSS gradient for the card background
  popular: boolean;
  timeEstimate: string;     // e.g. "~30s"
  funFact: string;          // Shown during generation
  prompt: string;           // FLUX Kontext Pro style-transfer prompt
}

export type AIPortraitStep = 'capture' | 'pick' | 'generating' | 'reveal' | 'saved';

export interface AIPortraitJob {
  id: string;
  styleId: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  inputImageUrl?: string;
  outputImageUrl?: string;
  progress: number;       // 0–100
  error?: string;
  startedAt: number;
}

// ── 10 AI Portrait Styles ──────────────────────────────────

export const AI_PORTRAIT_STYLES: AIPortraitStyle[] = [
  {
    id: 'castle-wedding',
    name: 'Castle Wedding',
    subtitle: 'Royal Spanish fairy tale',
    emoji: '🏰',
    gradient: 'linear-gradient(135deg, #8B7355 0%, #C4A882 50%, #D4B896 100%)',
    popular: true,
    timeEstimate: '~30s',
    funFact: 'Barcelona has over 20 castles and palaces, including the stunning Castell de Montjuïc overlooking the sea.',
    prompt: 'Restyle this portrait into a grand royal wedding scene inside a magnificent Spanish castle. The person\'s face must remain pixel-perfect — same exact facial structure, skin tone, eye color, nose, lips, and every distinguishing feature. Only change the setting and attire, NEVER the face. Dress them in opulent royal wedding attire with a jeweled crown. Place them in a grand stone hall with soaring arched ceilings, ornate golden chandeliers, rich velvet drapery in deep crimson and gold, tall stained glass windows casting warm light across marble floors. The atmosphere is regal and cinematic, like a royal wedding ceremony at a castle in Spain. Oil painting style with warm golden tones, masterpiece quality.',

  },
  {
    id: 'mughal-royalty',
    name: 'Mughal Royalty',
    subtitle: 'Jodha Akbar era',
    emoji: '👑',
    gradient: 'linear-gradient(135deg, #D4A853 0%, #C4704B 50%, #8B4513 100%)',
    popular: true,
    timeEstimate: '~30s',
    funFact: 'The Mughal Empire produced some of the most exquisite miniature paintings in history, blending Persian and Indian art traditions.',
    prompt: 'Restyle this portrait into a majestic Mughal-era royal scene in the style of the movie Jodhaa Akbar. The person\'s face must remain pixel-perfect — same exact facial structure, skin tone, eye color, nose, lips, and every distinguishing feature. Only change the setting and attire, NEVER the face. Dress them in lavish Mughal royal attire — rich brocade fabrics, heavy ornate gold and emerald jewelry, an elaborate turban or jeweled headpiece. Place them in the grand courtyard of a Mughal palace with intricate marble jali screens, pietra dura inlay work, lush Mughal gardens with fountains visible in the background, and Persian-style archways. The lighting is warm and golden, the mood is powerful and regal. Painted in the style of a Mughal miniature painting with rich jewel tones — deep reds, emerald greens, sapphire blues, and abundant gold leaf details.',

  },
  {
    id: 'bollywood-poster',
    name: 'Bollywood Poster',
    subtitle: 'Classic filmi glamour',
    emoji: '🎬',
    gradient: 'linear-gradient(135deg, #E84870 0%, #FF6B6B 50%, #FFD93D 100%)',
    popular: true,
    timeEstimate: '~25s',
    funFact: 'Bollywood produces over 1,500 films per year — more than Hollywood! The term comes from combining "Bombay" and "Hollywood".',
    prompt: 'Restyle this portrait into a classic hand-painted Bollywood movie poster from the golden era of Hindi cinema. The person\'s face must remain pixel-perfect — same exact facial structure, skin tone, eye color, nose, lips, and every distinguishing feature. Only change the styling and composition, NEVER the face. Make them the glamorous star of the film, styled with dramatic Bollywood fashion — flowing designer outfit, statement jewelry, wind-swept hair. The composition is a dramatic movie poster layout with vibrant saturated colors, dramatic spotlight lighting, golden sparkles and cinematic lens flares. The background features the skyline of Mumbai with the Gateway of India. The mood is larger-than-life filmi glamour. Bold, colorful, hand-painted Indian movie poster art style.',

  },
  {
    id: 'barcelona-mosaic',
    name: 'Barcelona',
    subtitle: 'Gaudi & Flamenco',
    emoji: '🎨',
    gradient: 'linear-gradient(135deg, #2B5F8A 0%, #E8865A 50%, #7A8B5C 100%)',
    popular: true,
    timeEstimate: '~35s',
    funFact: 'Antoni Gaud\u00ed\'s trencad\u00eds mosaic technique uses broken ceramic pieces. Park G\u00fcell alone contains over 15 million tile fragments.',
    prompt: 'Restyle this portrait into a vibrant Barcelona-inspired artistic scene. The person\'s face must remain pixel-perfect — same exact facial structure, skin tone, eye color, nose, lips, and every distinguishing feature. Only change the setting and artistic style, NEVER the face. Place them against the iconic backdrop of Antoni Gaud\u00ed\'s Sagrada Familia basilica and the colorful trencad\u00eds mosaics of Park G\u00fcell. The scene blends Barcelona\'s most iconic elements: the organic flowing architecture of Casa Batll\u00f3, warm Mediterranean sunlight, terracotta rooftops, and hints of flamenco culture with dramatic red and orange tones. The portrait is rendered in a colorful mosaic style inspired by Gaud\u00ed\'s ceramic tile work — Mediterranean blues, sun-baked oranges, olive greens, and terracotta reds. Warm golden hour lighting, artistic and celebratory.',

  },
  {
    id: 'watercolor',
    name: 'Watercolor Dream',
    subtitle: 'Romantic & ethereal',
    emoji: '🌸',
    gradient: 'linear-gradient(135deg, #E8C4B8 0%, #C4A8E0 50%, #A8D4E8 100%)',
    popular: false,
    timeEstimate: '~25s',
    funFact: 'Watercolor painting dates back 40,000 years to cave paintings. The technique became an art form in 18th century England.',
    prompt: 'Restyle this portrait as a beautiful romantic watercolor painting. The person\'s face must remain pixel-perfect — same exact facial structure, skin tone, eye color, nose, lips, and every distinguishing feature. Only change the artistic medium, NEVER the face. Paint them with soft, delicate brushstrokes in a wet-on-wet watercolor technique. Colors bleed and flow organically together — soft pinks, lavenders, and sky blues create a dreamy atmosphere. Surround the portrait with loose watercolor florals — peonies, roses, and wisteria dripping with pigment. The background dissolves into abstract washes of pastel color. The style is elegant fine art watercolor, like a wedding portrait painted by hand on textured watercolor paper. Ethereal, romantic, and luminous.',

  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    subtitle: 'Warhol vibes',
    emoji: '🎪',
    gradient: 'linear-gradient(135deg, #FF1744 0%, #FFD600 50%, #00E5FF 100%)',
    popular: false,
    timeEstimate: '~20s',
    funFact: 'Andy Warhol\'s "Shot Marilyns" sold for $195 million in 2022, making it the most expensive American artwork ever sold.',
    prompt: 'Restyle this portrait as a bold Andy Warhol-style pop art print. The person\'s face must remain recognizably identical — same exact facial structure, proportions, and every distinguishing feature. Only change the artistic rendering, NEVER alter the face shape or features. Render them with flat, graphic blocks of vivid color — hot pink, electric blue, bright yellow, and lime green. The style combines Warhol\'s screen-print aesthetic with Roy Lichtenstein\'s Ben-Day halftone dots and thick black outlines. High contrast, simplified forms, bold graphic shapes. The background is a single flat bright color. The overall feel is iconic, bold, and gallery-worthy — like a famous Warhol silkscreen print.',

  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    subtitle: 'Old masters',
    emoji: '🖼️',
    gradient: 'linear-gradient(135deg, #5C4033 0%, #8B6914 50%, #C4A882 100%)',
    popular: false,
    timeEstimate: '~35s',
    funFact: 'Leonardo da Vinci spent 4 years painting the Mona Lisa\'s lips. Renaissance portraits often contained hidden symbols and meanings.',
    prompt: 'Restyle this portrait as a Renaissance oil painting in the style of Leonardo da Vinci, Raphael, and Caravaggio. The person\'s face must remain pixel-perfect — same exact facial structure, skin tone, eye color, nose, lips, and every distinguishing feature. Only change the attire and artistic style, NEVER the face. Dress them in elegant 15th-century Italian noble attire — rich velvets, fine lace collars, subtle gold embroidery. The technique uses Leonardo\'s sfumato for soft, smoky transitions and Caravaggio\'s dramatic chiaroscuro lighting — a single warm light source from the left illuminating the face against a deep, dark umber background. The brushwork shows visible oil paint texture. Museum-quality masterpiece.',

  },
  {
    id: 'anime-ghibli',
    name: 'Anime / Ghibli',
    subtitle: 'Studio Ghibli magic',
    emoji: '✨',
    gradient: 'linear-gradient(135deg, #4FC3F7 0%, #81C784 50%, #FFB74D 100%)',
    popular: false,
    timeEstimate: '~25s',
    funFact: 'Studio Ghibli\'s "Spirited Away" won the Academy Award for Best Animated Feature in 2003 — the only hand-drawn anime to ever win.',
    prompt: 'Restyle this portrait as a beautiful Studio Ghibli anime character illustration in the style of Hayao Miyazaki. Even in anime style, the person must be clearly recognizable — preserve their exact face shape, proportions, hairstyle, hair color, skin tone, and all distinguishing features so they can identify themselves. Draw them as a hand-animated Ghibli character with expressive eyes and a gentle warm expression. Place them in a lush, magical Ghibli landscape — rolling green hills, towering cumulus clouds in a vivid blue sky, wildflowers swaying in the breeze, and a whimsical European-style cottage in the distance. The color palette is warm and inviting with soft natural lighting. The art style is hand-drawn cel animation with watercolor-like backgrounds, like a frame from Spirited Away or Howl\'s Moving Castle.',

  },
  {
    id: 'art-nouveau',
    name: 'Art Nouveau',
    subtitle: 'Mucha & Modernisme',
    emoji: '🌿',
    gradient: 'linear-gradient(135deg, #7A8B5C 0%, #D4A853 50%, #C4704B 100%)',
    popular: false,
    timeEstimate: '~30s',
    funFact: 'Barcelona is home to some of the world\'s finest Art Nouveau architecture. The style was called "Modernisme" in Catalonia.',
    prompt: 'Restyle this portrait as an elegant Art Nouveau poster in the style of Alphonse Mucha and Catalan Modernisme. The person\'s face must remain pixel-perfect — same exact facial structure, skin tone, eye color, nose, lips, and every distinguishing feature. Only change the artistic style, NEVER the face. Frame them within an ornate circular halo border decorated with flowing botanical elements — sinuous vines, lilies, and irises. The composition uses Mucha\'s signature flowing organic lines and decorative patterns. The color palette is muted earth tones with rich gold leaf accents, sage greens, dusty roses, and warm amber. Intricate geometric and floral borders frame the entire image like a vintage Parisian theatre poster.',

  },
  {
    id: 'impressionist',
    name: 'Impressionist',
    subtitle: 'Monet\'s garden',
    emoji: '🌻',
    gradient: 'linear-gradient(135deg, #6B8EC4 0%, #E8A868 50%, #8BC48B 100%)',
    popular: false,
    timeEstimate: '~30s',
    funFact: 'Claude Monet painted his famous water lilies series over 30 years, producing about 250 paintings of his garden at Giverny.',
    prompt: 'Restyle this portrait as a luminous French Impressionist oil painting in the style of Claude Monet, Pierre-Auguste Renoir, and Berthe Morisot. The person\'s face must remain pixel-perfect — same exact facial structure, skin tone, eye color, nose, lips, and every distinguishing feature. Only change the artistic style and setting, NEVER the face. Paint them with loose, visible brushstrokes and dappled natural sunlight filtering through the leaves. Place them in a beautiful garden setting reminiscent of Monet\'s Giverny — surrounded by water lilies, wisteria, iris flowers, and a Japanese-style bridge in soft focus behind them. The light is warm afternoon golden hour with dancing shadows. The paint application is thick impasto with a soft, luminous color palette of lavender, soft gold, sage green, and sky blue. Oil on canvas texture.',

  },
];

// ── Rate Limiting ─────────────────────────────────────────

const RATE_LIMIT_KEY = 'ai_portrait_count';
const RATE_LIMIT_MAX = 10;

export function getPortraitCount(): number {
  try {
    return parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

export function incrementPortraitCount(): void {
  try {
    const count = getPortraitCount() + 1;
    localStorage.setItem(RATE_LIMIT_KEY, String(count));
  } catch {
    // localStorage unavailable
  }
}

export function canGeneratePortrait(): boolean {
  return getPortraitCount() < RATE_LIMIT_MAX;
}

export function getRemainingPortraits(): number {
  return Math.max(0, RATE_LIMIT_MAX - getPortraitCount());
}

// ── API Helpers ───────────────────────────────────────────

/**
 * Convert a canvas photo to a base64 data URL suitable for API submission.
 * Resizes to max 1024px on longest side for faster generation.
 */
export function preparePhotoForAI(canvas: HTMLCanvasElement): string {
  const maxDim = 1024;
  const w = canvas.width;
  const h = canvas.height;
  const scale = Math.min(maxDim / w, maxDim / h, 1);

  const resized = document.createElement('canvas');
  resized.width = Math.round(w * scale);
  resized.height = Math.round(h * scale);
  const ctx = resized.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/jpeg', 0.9);

  ctx.drawImage(canvas, 0, 0, resized.width, resized.height);
  return resized.toDataURL('image/jpeg', 0.9);
}

/**
 * Call the backend /api/ai-portrait/generate endpoint (OpenAI gpt-image-1.5).
 * Progress is simulated on the client since the API call is synchronous.
 * Real generation takes ~15-40s.
 */
export async function generateAIPortrait(
  photoDataUrl: string,
  style: AIPortraitStyle,
  onProgress: (pct: number) => void,
): Promise<string> {
  // Start simulated progress while the backend processes
  let progress = 0;
  let done = false;
  const progressInterval = setInterval(() => {
    if (done) return;
    // Ramp up quickly to ~85%, then slow down
    const remaining = 85 - progress;
    progress += Math.max(1, remaining * 0.08 + Math.random() * 3);
    progress = Math.min(progress, 85);
    onProgress(Math.round(progress));
  }, 800);

  try {
    const res = await fetch('/api/ai-portrait/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: photoDataUrl,
        styleId: style.id,
        prompt: style.prompt,
      }),
    });

    done = true;
    clearInterval(progressInterval);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Generation failed' }));
      throw new Error(err.error || `Server error: ${res.status}`);
    }

    const data = await res.json();

    if (!data.output) {
      throw new Error('No output image returned');
    }

    onProgress(100);
    return data.output;
  } catch (error) {
    done = true;
    clearInterval(progressInterval);
    throw error;
  }
}

