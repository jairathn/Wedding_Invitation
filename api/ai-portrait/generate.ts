// POST /api/ai-portrait/generate — Generate an AI portrait via Replicate SDXL
// Expects JSON body: { image: string (base64 data URL), styleId: string, prompt: string, negativePrompt: string }
// Returns: { id: string, status: string, output?: string }

import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    // The model takes the photo and re-renders it in the requested style
    const output = await replicate.run(
      'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
      {
        input: {
          image,
          prompt,
          negative_prompt: negativePrompt || 'deformed, ugly, blurry, low quality, watermark, text',
          prompt_strength: 0.65,       // Balance between original photo and style
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 1024,
          height: 1024,
          scheduler: 'K_EULER',
          refine: 'expert_ensemble_refiner',
          high_noise_frac: 0.8,
        },
      }
    );

    // Replicate returns an array of output URLs for image models
    const outputUrl = Array.isArray(output) ? output[0] : output;

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
      output: String(outputUrl),
    });
  } catch (error: unknown) {
    console.error('AI Portrait generation error:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    return res.status(500).json({ error: message });
  }
}
