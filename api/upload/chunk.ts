// POST /api/upload/chunk — Forward a single video chunk to Google Drive's
// resumable upload endpoint.  The session URI (returned by /api/upload/initiate)
// is self-authenticating, so no Google credentials are needed here.
//
// Request body:
//   { sessionUri, chunk (base64), offset, totalSize }
//
// Response:
//   Intermediate chunk → { complete: false, nextOffset }
//   Final chunk        → { complete: true, driveFileId }
//
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionUri, chunk, offset, totalSize } = req.body;

    if (!sessionUri || !chunk || offset == null || !totalSize) {
      return res.status(400).json({ error: 'Missing required fields: sessionUri, chunk, offset, totalSize' });
    }

    const chunkBuffer = Buffer.from(chunk as string, 'base64');
    const chunkSize = chunkBuffer.length;
    const rangeStart = offset as number;
    const rangeEnd = rangeStart + chunkSize - 1;
    const total = totalSize as number;

    // PUT chunk to Google Drive resumable upload endpoint
    const putRes = await fetch(sessionUri as string, {
      method: 'PUT',
      headers: {
        'Content-Length': String(chunkSize),
        'Content-Range': `bytes ${rangeStart}-${rangeEnd}/${total}`,
      },
      body: chunkBuffer,
    });

    // 308 Resume Incomplete = intermediate chunk accepted
    if (putRes.status === 308) {
      // Parse the Range header to confirm what Drive received
      const range = putRes.headers.get('range');
      const nextOffset = range ? parseInt(range.split('-')[1], 10) + 1 : rangeEnd + 1;
      return res.status(200).json({ complete: false, nextOffset });
    }

    // 200/201 = final chunk, upload complete
    if (putRes.ok) {
      const driveFile = await putRes.json();
      return res.status(200).json({
        complete: true,
        driveFileId: driveFile.id,
      });
    }

    // Error
    const errBody = await putRes.text();
    console.error('Drive chunk upload failed:', putRes.status, errBody);
    return res.status(502).json({ error: `Drive returned ${putRes.status}`, details: errBody });
  } catch (error) {
    console.error('Chunk upload error:', error);
    return res.status(500).json({ error: 'Chunk upload failed' });
  }
}
