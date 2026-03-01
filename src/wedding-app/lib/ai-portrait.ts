// AI Portrait system — style definitions, API helpers, and rate limiting
// Uses Replicate SDXL + IP-Adapter for face-preserving style transfer

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
    subtitle: 'European fairy tale',
    emoji: '🏰',
    gradient: 'linear-gradient(135deg, #8B7355 0%, #C4A882 50%, #D4B896 100%)',
    popular: true,
    timeEstimate: '~30s',
    funFact: 'Barcelona has over 20 castles and palaces, including the stunning Castell de Montjuïc overlooking the sea.',
    prompt: 'royal portrait painting of {subject} in an ornate European castle ballroom, golden chandeliers, marble columns, dramatic window light, oil painting style, regal and elegant, warm golden tones, masterpiece quality',
    negativePrompt: 'cartoon, anime, deformed, ugly, blurry, low quality, watermark, text',
  },
  {
    id: 'mughal-royalty',
    name: 'Mughal Royalty',
    subtitle: 'Indian royal court',
    emoji: '👑',
    gradient: 'linear-gradient(135deg, #D4A853 0%, #C4704B 50%, #8B4513 100%)',
    popular: true,
    timeEstimate: '~30s',
    funFact: 'The Mughal Empire produced some of the most exquisite miniature paintings in history, blending Persian and Indian art traditions.',
    prompt: 'Mughal miniature painting style portrait of {subject}, ornate gold jewelry, richly decorated palace backdrop, intricate patterns, jewel tones, royal Indian court, masterful detail, warm lighting',
    negativePrompt: 'cartoon, anime, deformed, ugly, blurry, low quality, watermark, text, modern clothing',
  },
  {
    id: 'bollywood-poster',
    name: 'Bollywood Poster',
    subtitle: 'Filmi glamour',
    emoji: '🎬',
    gradient: 'linear-gradient(135deg, #E84870 0%, #FF6B6B 50%, #FFD93D 100%)',
    popular: true,
    timeEstimate: '~25s',
    funFact: 'Bollywood produces over 1,500 films per year — more than Hollywood! The term comes from combining "Bombay" and "Hollywood".',
    prompt: 'dramatic Bollywood movie poster featuring {subject}, vibrant saturated colors, dramatic lighting, sparkles and lens flares, Hindi film aesthetic, glamorous, cinematic, hand-painted movie poster style',
    negativePrompt: 'cartoon, anime, deformed, ugly, blurry, low quality, watermark',
  },
  {
    id: 'barcelona-mosaic',
    name: 'Barcelona Mosaic',
    subtitle: 'Gaudí-inspired',
    emoji: '🎨',
    gradient: 'linear-gradient(135deg, #2B5F8A 0%, #E8865A 50%, #7A8B5C 100%)',
    popular: true,
    timeEstimate: '~35s',
    funFact: 'Antoni Gaudí\'s trencadís mosaic technique uses broken ceramic pieces. Park Güell alone contains over 15 million tile fragments.',
    prompt: 'portrait of {subject} rendered in the style of Antoni Gaudí trencadís mosaic, colorful ceramic tiles, organic flowing forms, Barcelona architecture backdrop, Mediterranean colors, artistic mosaic portrait',
    negativePrompt: 'realistic photo, deformed, ugly, blurry, low quality, watermark, text',
  },
  {
    id: 'watercolor',
    name: 'Watercolor Dream',
    subtitle: 'Soft and dreamy',
    emoji: '🌸',
    gradient: 'linear-gradient(135deg, #E8C4B8 0%, #C4A8E0 50%, #A8D4E8 100%)',
    popular: false,
    timeEstimate: '~25s',
    funFact: 'Watercolor painting dates back 40,000 years to cave paintings. The technique became an art form in 18th century England.',
    prompt: 'beautiful watercolor painting portrait of {subject}, soft brushstrokes, flowing colors bleeding together, floral watercolor elements, pastel tones, dreamy ethereal atmosphere, delicate and romantic, wet-on-wet technique',
    negativePrompt: 'cartoon, deformed, ugly, blurry, low quality, watermark, text, harsh lines, digital art',
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
    prompt: 'pop art portrait of {subject} in the style of Andy Warhol and Roy Lichtenstein, bold flat colors, halftone dots, thick black outlines, bright primary colors, comic book style, screen print aesthetic',
    negativePrompt: 'realistic, photograph, deformed, ugly, blurry, low quality, watermark, text, 3d render',
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    subtitle: 'Old masters style',
    emoji: '🖼️',
    gradient: 'linear-gradient(135deg, #5C4033 0%, #8B6914 50%, #C4A882 100%)',
    popular: false,
    timeEstimate: '~35s',
    funFact: 'Leonardo da Vinci spent 4 years painting the Mona Lisa\'s lips. Renaissance portraits often contained hidden symbols and meanings.',
    prompt: 'Renaissance oil painting portrait of {subject} in the style of Raphael and Leonardo da Vinci, sfumato technique, rich dark background, dramatic chiaroscuro lighting, noble attire, classical composition, museum quality masterpiece',
    negativePrompt: 'cartoon, anime, deformed, ugly, blurry, low quality, watermark, text, modern clothing, bright colors',
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
    prompt: 'Studio Ghibli anime style portrait of {subject}, soft hand-drawn animation style, warm natural lighting, gentle expression, lush background scenery, Hayao Miyazaki aesthetic, beautiful detailed anime art',
    negativePrompt: 'realistic, photograph, deformed, ugly, blurry, low quality, watermark, text, 3d render, western cartoon',
  },
  {
    id: 'art-nouveau',
    name: 'Art Nouveau',
    subtitle: 'Mucha-inspired',
    emoji: '🌿',
    gradient: 'linear-gradient(135deg, #7A8B5C 0%, #D4A853 50%, #C4704B 100%)',
    popular: false,
    timeEstimate: '~30s',
    funFact: 'Barcelona is home to some of the world\'s finest Art Nouveau architecture. The style was called "Modernisme" in Catalonia.',
    prompt: 'Art Nouveau portrait of {subject} in the style of Alphonse Mucha, ornate floral border, flowing organic lines, muted earth tones with gold accents, decorative halo pattern, elegant poster design, botanical elements',
    negativePrompt: 'cartoon, anime, deformed, ugly, blurry, low quality, watermark, text, 3d render, modern',
  },
  {
    id: 'impressionist',
    name: 'Impressionist',
    subtitle: 'Monet-style',
    emoji: '🌻',
    gradient: 'linear-gradient(135deg, #6B8EC4 0%, #E8A868 50%, #8BC48B 100%)',
    popular: false,
    timeEstimate: '~30s',
    funFact: 'Claude Monet painted his famous water lilies series over 30 years, producing about 250 paintings of his garden at Giverny.',
    prompt: 'Impressionist painting portrait of {subject} in the style of Claude Monet and Pierre-Auguste Renoir, visible brushstrokes, dappled natural light, garden setting, soft color palette, plein air painting, oil on canvas texture',
    negativePrompt: 'cartoon, anime, deformed, ugly, blurry, low quality, watermark, text, sharp lines, digital art',
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
 * Call the backend /api/ai-portrait/generate endpoint which uses Replicate SDXL.
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
        negativePrompt: style.negativePrompt,
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
 * Returns the drive file ID on success.
 */
export async function savePortraitToDrive(
  imageUrl: string,
  styleId: string,
  guestId: number,
  guestName: string,
): Promise<{ success: boolean; driveFileId?: string }> {
  // Fetch the image and convert to base64
  const imageRes = await fetch(imageUrl);
  const blob = await imageRes.blob();

  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

  const filename = `ai-portrait_${styleId}_${guestName.toLowerCase().replace(/\s+/g, '-')}_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;

  const res = await fetch('/api/upload/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: base64.split(',')[1], // strip data URL prefix
      metadata: {
        guestId,
        guestName,
        eventSlug: 'wedding_reception',
        mediaType: 'photo',
        filterApplied: `ai-portrait-${styleId}`,
      },
      filename,
      contentType: 'image/jpeg',
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to save to Google Drive');
  }

  return res.json();
}
