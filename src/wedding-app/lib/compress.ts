// Client-side media compression before upload.
// Photos are resized to MAX_DIMENSION and JPEG-compressed.
// Videos are passed through as-is (handled by resumable upload).

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;

/** Compress a photo blob by resizing + JPEG quality reduction. */
export async function compressPhoto(blob: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(blob);
  const { width, height } = bmp;

  // Calculate target dimensions (preserve aspect ratio)
  let tw = width;
  let th = height;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    tw = Math.round(width * scale);
    th = Math.round(height * scale);
  }

  // Draw to OffscreenCanvas (or fallback to regular canvas)
  let canvas: OffscreenCanvas | HTMLCanvasElement;
  let ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;

  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(tw, th);
    ctx = canvas.getContext('2d');
  } else {
    const el = document.createElement('canvas');
    el.width = tw;
    el.height = th;
    canvas = el;
    ctx = el.getContext('2d');
  }

  if (!ctx) throw new Error('Could not get canvas context');
  ctx.drawImage(bmp, 0, 0, tw, th);
  bmp.close();

  // Export as JPEG
  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: 'image/jpeg', quality: JPEG_QUALITY });
  }
  return new Promise<Blob>((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      b => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}
