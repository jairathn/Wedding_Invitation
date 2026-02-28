// Camera access utilities

export async function requestCamera(
  facingMode: 'user' | 'environment' = 'user',
  includeAudio: boolean = false
): Promise<MediaStream> {
  const constraints: MediaStreamConstraints = {
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
      facingMode,
    },
    audio: includeAudio,
  };

  return navigator.mediaDevices.getUserMedia(constraints);
}

export function stopStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

export function getSupportedMimeType(): string {
  const types = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return 'video/webm';
}

export function capturePhotoFromCanvas(
  video: HTMLVideoElement,
  filter: string = 'none'
): { blob: Blob; dataUrl: string } | null {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Apply CSS filter
  if (filter && filter !== 'none') {
    ctx.filter = filter;
  }

  // Mirror the image for front camera
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

  // Convert to blob
  const byteString = atob(dataUrl.split(',')[1]);
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });

  return { blob, dataUrl };
}

export function capturePhotoFromFilteredCanvas(
  canvas: HTMLCanvasElement
): { blob: Blob; dataUrl: string } | null {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const byteString = atob(dataUrl.split(',')[1]);
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });
  return { blob, dataUrl };
}

export function generateFilename(
  mediaType: 'video' | 'photo',
  eventSlug: string,
  guestName: string
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = guestName.toLowerCase().replace(/\s+/g, '-');
  const ext = mediaType === 'video' ? 'webm' : 'jpg';
  return `${mediaType}_${eventSlug}_${safeName}_${timestamp}.${ext}`;
}
