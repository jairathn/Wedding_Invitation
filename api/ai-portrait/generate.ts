// POST /api/ai-portrait/generate — Generate an AI portrait via Replicate FLUX Kontext Pro
// Expects JSON body: { image: string (base64 data URL), styleId: string, prompt: string }
// Returns: { status: string, output: string (base64 data URL) }

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel serverless functions have a 60s default timeout.
// Replicate generation takes ~15-40s, and we may need to retry on 429.
export const config = {
  maxDuration: 60,
};

/** Sleep helper */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Run a Replicate prediction with automatic retry on 429 rate limits */
async function runWithRetry(
  replicate: { run: Function },
  model: string,
  input: Record<string, unknown>,
  maxRetries: number = 2,
): Promise<unknown> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await replicate.run(model, { input });
    } catch (err: unknown) {
      const isRateLimit =
        err instanceof Error &&
        (err.message.includes('429') || err.message.includes('Too Many Requests'));

      if (!isRateLimit || attempt === maxRetries) {
        throw err;
      }

      // Parse retry-after from error message, default to 10s
      const retryMatch = err.message.match(/resets in ~(\d+)s/);
      const waitSeconds = retryMatch ? parseInt(retryMatch[1], 10) + 2 : 10;
      console.log(`Rate limited, waiting ${waitSeconds}s before retry ${attempt + 1}/${maxRetries}`);
      await sleep(waitSeconds * 1000);
    }
  }
  throw new Error('Max retries exceeded');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    return res.status(500).json({ error: 'REPLICATE_API_TOKEN not configured' });
  }

  try {
    const { image, styleId, prompt } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({ error: 'Missing required fields: image, prompt' });
    }

    const Replicate = (await import('replicate')).default;
    const replicate = new Replicate({ auth: apiToken });

    // Wrap the style prompt with strong identity-preservation instructions.
    // Kontext Pro weights early tokens heavily, so we front-load the identity
    // directive and reinforce it at the end (bookend strategy).
    const identityPrefix =
      'This is a photo of a REAL PERSON. You MUST preserve their EXACT facial identity throughout the transformation. ' +
      'Keep the same face shape, bone structure, nose shape, eye shape, eye color, eyebrow shape, lip shape, ' +
      'skin tone, skin texture, hair color, hair length, hair style, facial hair, and all distinguishing features ' +
      'such as moles, dimples, wrinkles, freckles, and scars. ' +
      'Do NOT idealize, beautify, slim, age, de-age, or alter their face in any way. ' +
      'The person in the output must be INSTANTLY recognizable as the exact same individual.\n\n';
    const identitySuffix =
      '\n\nIMPORTANT: The face in the output MUST be a precise match to the input photo. ' +
      'If you cannot apply the style without changing the face, prioritize facial accuracy over style. ' +
      'This is a real person — they must recognize themselves.';
    const fullPrompt = identityPrefix + prompt + identitySuffix;

    // Use FLUX Kontext Pro for text-guided style transfer with the user's photo.
    // safety_tolerance: 6 (max, default) — wedding guests in formal attire don't
    // need aggressive safety filtering.  Lower values (1-3) can degrade output
    // quality or refuse perfectly normal portraits.
    const output = await runWithRetry(
      replicate,
      'black-forest-labs/flux-kontext-pro',
      {
        input_image: image,
        prompt: fullPrompt,
        aspect_ratio: '1:1',
        output_format: 'jpg',
        safety_tolerance: 6,
      },
    );

    // Kontext Pro returns a single FileOutput (URL string via toString)
    const outputUrl = Array.isArray(output) ? output[0] : output;

    if (!outputUrl) {
      return res.status(500).json({ error: 'No output from model' });
    }

    // Fetch the generated image server-side and return as base64 data URL.
    // This avoids CORS issues when the frontend tries to save/upload the image.
    const imageRes = await fetch(String(outputUrl));
    if (!imageRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch generated image from Replicate' });
    }
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const contentType = imageRes.headers.get('content-type') || 'image/png';
    const base64DataUrl = `data:${contentType};base64,${imageBuffer.toString('base64')}`;

    // Record in database if available
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(dbUrl);
        await sql`
          INSERT INTO ai_portraits (id, style_id, status, output_url, created_at)
          VALUES (${crypto.randomUUID()}, ${styleId || 'unknown'}, ${'complete'}, ${String(outputUrl)}, ${new Date().toISOString()})
        `;
      } catch {
        // DB table may not exist yet — that's fine
      }
    }

    return res.status(200).json({
      status: 'complete',
      output: base64DataUrl,
    });
  } catch (error: unknown) {
    // Sanitize error message — never leak API tokens or internal details
    const rawMessage = error instanceof Error ? error.message : 'Generation failed';

    // Check for rate limit specifically
    if (rawMessage.includes('429') || rawMessage.includes('Too Many Requests')) {
      return res.status(429).json({
        error: 'AI portrait generation is busy right now. Please wait a moment and try again.',
      });
    }

    console.error('AI Portrait generation error:', rawMessage);
    return res.status(500).json({
      error: 'Portrait generation failed. Please try again.',
    });
  }
}
