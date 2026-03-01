// POST /api/ai-portrait/generate — Generate an AI portrait via Replicate SDXL
// Expects JSON body: { image: string (base64 data URL), styleId: string, prompt: string, negativePrompt: string }
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
    const { image, styleId, prompt, negativePrompt } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({ error: 'Missing required fields: image, prompt' });
    }

    const Replicate = (await import('replicate')).default;
    const replicate = new Replicate({ auth: apiToken });

    // Use SDXL img2img for style transfer with the user's photo as input
    const output = await runWithRetry(
      replicate,
      'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
      {
        image,
        prompt,
        negative_prompt: negativePrompt || 'deformed, ugly, blurry, low quality, watermark, text',
        prompt_strength: 0.65,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        width: 1024,
        height: 1024,
        scheduler: 'K_EULER',
        refine: 'expert_ensemble_refiner',
        high_noise_frac: 0.8,
      },
    );

    // Replicate returns an array of output URLs for image models
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
