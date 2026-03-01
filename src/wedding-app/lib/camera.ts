// Camera access utilities

export type CameraPermission = 'granted' | 'denied' | 'prompt';

const CAMERA_PERM_KEY = 'camera_permission_granted';

/** Check camera permission state without triggering a prompt */
export async function checkCameraPermission(): Promise<CameraPermission> {
  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return result.state as CameraPermission;
  } catch {
    // Firefox / older browsers don't support permissions.query for camera.
    // Check our localStorage cache — if the user previously granted access,
    // treat it as 'granted' so we skip the custom permission screen and go
    // straight to getUserMedia (the browser will allow it silently).
    try {
      if (localStorage.getItem(CAMERA_PERM_KEY) === 'true') {
        return 'granted';
      }
    } catch { /* localStorage unavailable */ }
    return 'prompt';
  }
}

export async function requestCamera(
  facingMode: 'user' | 'environment' = 'user',
  includeAudio: boolean = false
): Promise<MediaStream> {
  const constraints: MediaStreamConstraints = {
    video: {
      width: { ideal: 3840 },
      height: { ideal: 2160 },
      frameRate: { ideal: 30 },
      facingMode,
    },
    audio: includeAudio,
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  // getUserMedia succeeded — remember that the user granted camera access
  try { localStorage.setItem(CAMERA_PERM_KEY, 'true'); } catch { /* ok */ }

  return stream;
}

export function stopStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

export function getSupportedMimeType(): string {
  // Prefer mp4 (H.264 + AAC) — universally playable everywhere including
  // Google Drive's web player, Apple Photos, and video editors.
  // webm with Opus audio causes "Audio decoder error" in Google Drive.
  // Chrome 116+ supports mp4 MediaRecorder; Safari uses mp4 natively.
  const types = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2', // H.264 Baseline + AAC-LC
    'video/mp4;codecs=avc1',                    // H.264 (let browser pick audio)
    'video/mp4',                                // Generic mp4
    'video/webm;codecs=vp9,opus',              // Fallback: VP9 + Opus
    'video/webm;codecs=vp8,opus',              // Fallback: VP8 + Opus
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log(`[camera] Selected recording format: ${type}`);
      return type;
    }
  }
  console.warn('[camera] No preferred format supported, falling back to video/webm');
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

  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

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
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
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
  guestName: string,
  mimeType?: string
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = guestName.toLowerCase().replace(/\s+/g, '-');
  let ext = 'jpg';
  if (mediaType === 'video') {
    ext = mimeType?.includes('mp4') ? 'mp4' : 'webm';
  }
  return `${mediaType}_${eventSlug}_${safeName}_${timestamp}.${ext}`;
}
