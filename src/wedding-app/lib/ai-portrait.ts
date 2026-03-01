// AI Portrait system — style definitions, API helpers, and rate limiting
// Uses Replicate FLUX Kontext Pro for text-guided style transfer

export interface AIPortraitStyle {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  gradient: string;         // CSS gradient for the card background
  popular: boolean;
  timeEstimate: string;     // e.g. "~30s"
  funFact: string;          // Shown during generation
  prompt: string;           // Replicate SDXL prompt
  negativePrompt: string;
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
    prompt: 'Transform this photo into a grand royal wedding portrait set inside a magnificent Spanish castle. The person is wearing opulent royal wedding attire with a jeweled crown, standing in a grand stone hall with soaring arched ceilings, ornate golden chandeliers, rich velvet drapery in deep crimson and gold, tall stained glass windows casting warm light across marble floors. The atmosphere is regal and cinematic, like a royal wedding ceremony at a castle in Spain. Oil painting style with warm golden tones, masterpiece quality.',
    negativePrompt: '',
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
    prompt: 'Transform this photo into a majestic Mughal-era royal portrait in the style of the movie Jodhaa Akbar. The person is dressed in lavish Mughal royal attire — rich brocade fabrics, heavy ornate gold and emerald jewelry, an elaborate turban or jeweled headpiece. They are standing in the grand courtyard of a Mughal palace with intricate marble jali screens, pietra dura inlay work, lush Mughal gardens with fountains visible in the background, and Persian-style archways. The lighting is warm and golden, the mood is powerful and regal. Painted in the style of a Mughal miniature painting with rich jewel tones — deep reds, emerald greens, sapphire blues, and abundant gold leaf details.',
    negativePrompt: '',
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
    prompt: 'Transform this photo into a classic hand-painted Bollywood movie poster from the golden era of Hindi cinema. The person is the glamorous star of the film, styled with dramatic Bollywood fashion — flowing designer outfit, statement jewelry, wind-swept hair. The composition is a dramatic movie poster layout with vibrant saturated colors, dramatic spotlight lighting, golden sparkles and cinematic lens flares. The background features the skyline of Mumbai with the Gateway of India. The mood is larger-than-life filmi glamour, like a premiere poster for a blockbuster starring Shah Rukh Khan, Hrithik Roshan, Deepika Padukone, or Aishwarya Rai. Bold, colorful, hand-painted Indian movie poster art style.',
    negativePrompt: '',
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
    prompt: 'Transform this photo into a vibrant Barcelona-inspired artistic portrait. The person is set against the iconic backdrop of Antoni Gaud\u00ed\'s Sagrada Familia basilica and the colorful trencad\u00eds mosaics of Park G\u00fcell. The scene blends Barcelona\'s most iconic elements: the organic flowing architecture of Casa Batll\u00f3, warm Mediterranean sunlight, terracotta rooftops, and hints of flamenco culture with dramatic red and orange tones. The portrait is rendered in a colorful mosaic style inspired by Gaud\u00ed\'s ceramic tile work — broken tile fragments forming the image in Mediterranean blues, sun-baked oranges, olive greens, and terracotta reds. Warm golden hour lighting, artistic and celebratory.',
    negativePrompt: '',
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
    prompt: 'Transform this photo into a beautiful romantic watercolor painting. The person is painted with soft, delicate brushstrokes in a wet-on-wet watercolor technique. Colors bleed and flow organically together — soft pinks, lavenders, and sky blues create a dreamy atmosphere. Surrounding the portrait are loose watercolor florals — peonies, roses, and wisteria dripping with pigment. The background dissolves into abstract washes of pastel color. The style is elegant fine art watercolor, like a wedding portrait painted by hand on textured watercolor paper. Ethereal, romantic, and luminous.',
    negativePrompt: '',
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
    prompt: 'Transform this photo into a bold Andy Warhol-style pop art portrait. The image uses flat, graphic blocks of vivid color — hot pink, electric blue, bright yellow, and lime green. The style combines Warhol\'s screen-print aesthetic with Roy Lichtenstein\'s Ben-Day halftone dots and thick black outlines. High contrast, simplified forms, bold graphic shapes. The background is a single flat bright color. The overall feel is iconic, bold, and gallery-worthy — like a famous Warhol silkscreen print hanging in MoMA.',
    negativePrompt: '',
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
    prompt: 'Transform this photo into a Renaissance oil painting portrait in the style of Leonardo da Vinci, Raphael, and Caravaggio. The person is dressed in elegant 15th-century Italian noble attire — rich velvets, fine lace collars, subtle gold embroidery. The technique uses Leonardo\'s sfumato for soft, smoky transitions and Caravaggio\'s dramatic chiaroscuro lighting — a single warm light source from the left illuminating the face against a deep, dark umber background. The brushwork shows visible oil paint texture. Museum-quality masterpiece, as if discovered in the Uffizi Gallery in Florence.',
    negativePrompt: '',
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
    prompt: 'Transform this photo into a beautiful Studio Ghibli anime character illustration in the style of Hayao Miyazaki. The person is drawn as a hand-animated Ghibli character with large expressive eyes, soft rounded features, and a gentle warm expression. They are standing in a lush, magical Ghibli landscape — rolling green hills, towering cumulus clouds in a vivid blue sky, wildflowers swaying in the breeze, and perhaps a whimsical European-style cottage in the distance. The color palette is warm and inviting with soft natural lighting. The art style is hand-drawn cel animation with watercolor-like backgrounds, exactly like a frame from Spirited Away, Howl\'s Moving Castle, or Kiki\'s Delivery Service.',
    negativePrompt: '',
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
    prompt: 'Transform this photo into an elegant Art Nouveau poster portrait in the style of Alphonse Mucha and Catalan Modernisme. The person is framed within an ornate circular halo border decorated with flowing botanical elements — sinuous vines, lilies, and irises. The composition uses Mucha\'s signature flowing organic lines and decorative patterns. The color palette is muted earth tones with rich gold leaf accents, sage greens, dusty roses, and warm amber. Intricate geometric and floral borders frame the entire image like a vintage Parisian theatre poster. The typography-ready design evokes Barcelona\'s Palau de la M\u00fasica Catalana.',
    negativePrompt: '',
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
    prompt: 'Transform this photo into a luminous French Impressionist oil painting in the style of Claude Monet, Pierre-Auguste Renoir, and Berthe Morisot. The person is painted with loose, visible brushstrokes and dappled natural sunlight filtering through the leaves. They are in a beautiful garden setting reminiscent of Monet\'s Giverny — surrounded by water lilies, wisteria, iris flowers, and a Japanese-style bridge in soft focus behind them. The light is warm afternoon golden hour with dancing shadows. The paint application is thick impasto with a soft, luminous color palette of lavender, soft gold, sage green, and sky blue. Oil on canvas texture is visible throughout.',
    negativePrompt: '',
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
 * Call the backend /api/ai-portrait/generate endpoint which uses FLUX Kontext Pro.
 * Progress is simulated on the client since Replicate's run() is synchronous
 * (blocks until done). The real generation takes ~15-40s.
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

/**
 * Upload an AI portrait image to Google Drive via the existing upload endpoint.
 * The imageDataUrl should be a base64 data URL (returned by the generate endpoint).
 * Returns the drive file ID on success.
 */
export async function savePortraitToDrive(
  imageDataUrl: string,
  styleId: string,
  guestId: number,
  guestName: string,
): Promise<{ success: boolean; driveFileId?: string }> {
  // Extract base64 content from the data URL
  let base64Content: string;
  let mimeType = 'image/jpeg';

  if (imageDataUrl.startsWith('data:')) {
    // Already a data URL — extract base64 part directly
    const [header, data] = imageDataUrl.split(',');
    base64Content = data;
    const mimeMatch = header.match(/data:([^;]+)/);
    if (mimeMatch) mimeType = mimeMatch[1];
  } else {
    // External URL fallback — fetch and convert (may fail due to CORS)
    const imageRes = await fetch(imageDataUrl);
    const blob = await imageRes.blob();
    mimeType = blob.type || 'image/jpeg';
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    base64Content = dataUrl.split(',')[1];
  }

  const filename = `ai-portrait_${styleId}_${guestName.toLowerCase().replace(/\s+/g, '-')}_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;

  const res = await fetch('/api/upload/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: base64Content,
      metadata: {
        guestId,
        guestName,
        eventSlug: 'wedding_reception',
        mediaType: 'photo',
        filterApplied: `ai-portrait-${styleId}`,
      },
      filename,
      contentType: mimeType,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`Failed to save to Google Drive: ${res.status} ${errorBody}`);
  }

  return res.json();
}
