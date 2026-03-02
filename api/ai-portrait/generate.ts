// POST /api/ai-portrait/generate — Generate an AI portrait via OpenAI gpt-image-1.5
// Expects JSON body: { image: string (base64 data URL), styleId: string, prompt: string }
// Returns: { status: string, output: string (base64 data URL) }

import type { VercelRequest, VercelResponse } from '@vercel/node';

// OpenAI image generation can take 30-60s. Vercel Pro allows up to 300s.
export const config = {
  maxDuration: 120,
};

/** Sleep helper */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }

  try {
    const { image, styleId, prompt } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({ error: 'Missing required fields: image, prompt' });
    }

    // Wrap the style prompt with identity-preservation instructions.
    // OpenAI's input_fidelity: "high" does most of the heavy lifting for face
    // preservation, but explicit prompt instructions reinforce the intent.
    const identityPrefix =
      'This is a photo of a REAL PERSON. Preserve their EXACT facial identity throughout the transformation. ' +
      'Keep the same face shape, bone structure, nose, eyes, eye color, eyebrows, lips, ' +
      'skin tone, skin texture, hair color, hair style, facial hair, and all distinguishing features ' +
      '(moles, dimples, wrinkles, freckles, scars). ' +
      'Do NOT idealize, beautify, slim, age, de-age, or alter their face in any way.\n\n';
    const identitySuffix =
      '\n\nThe face in the output MUST be a precise match to the input photo. ' +
      'Prioritize facial accuracy over style. This is a real person — they must recognize themselves.';
    const fullPrompt = identityPrefix + prompt + identitySuffix;

    const { default: OpenAI, toFile } = await import('openai');
    const openai = new OpenAI({ apiKey });

    // Convert the base64 data URL to a File object for the SDK.
    // The images.edit endpoint expects Uploadable (File), not a URL string.
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imageFile = await toFile(imageBuffer, 'portrait.jpg', { type: 'image/jpeg' });

    // Use gpt-image-1.5 with the images.edit endpoint for style transfer.
    // input_fidelity: "high" is the key parameter — it tells the model to
    // preserve faces and fine details from the input image.
    const maxRetries = 2;
    let result;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        result = await openai.images.edit({
          model: 'gpt-image-1.5',
          image: imageFile,
          prompt: fullPrompt,
          input_fidelity: 'high',
          quality: 'high',
          size: '1024x1024',
        });
        break;
      } catch (err: unknown) {
        const isRateLimit =
          err instanceof Error &&
          (err.message.includes('429') || err.message.includes('rate_limit'));

        if (!isRateLimit || attempt === maxRetries) {
          throw err;
        }

        const waitSeconds = 5 * (attempt + 1);
        console.log(`Rate limited, waiting ${waitSeconds}s before retry ${attempt + 1}/${maxRetries}`);
        await sleep(waitSeconds * 1000);
      }
    }

    if (!result?.data?.[0]?.b64_json) {
      return res.status(500).json({ error: 'No output from model' });
    }

    // gpt-image-1.5 returns base64 directly — no need to fetch from a URL
    const base64DataUrl = `data:image/png;base64,${result.data[0].b64_json}`;

    // Record in database if available
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(dbUrl);
        await sql`
          INSERT INTO ai_portraits (id, style_id, status, output_url, created_at)
          VALUES (${crypto.randomUUID()}, ${styleId || 'unknown'}, ${'complete'}, ${'openai-b64'}, ${new Date().toISOString()})
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
    // Sanitize error message — never leak API keys or internal details
    const rawMessage = error instanceof Error ? error.message : 'Generation failed';

    // Check for rate limit specifically
    if (rawMessage.includes('429') || rawMessage.includes('rate_limit')) {
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
