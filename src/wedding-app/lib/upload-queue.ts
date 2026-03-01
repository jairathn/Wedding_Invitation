// IndexedDB-based offline upload queue
//
// Upload flow (same for photos and videos):
//   1. Compress photos client-side (videos pass through as-is)
//   2. POST /api/upload/sign → server creates Drive folders, starts
//      resumable upload, returns session URI
//   3. PUT the file directly to googleapis.com (CORS built-in)
//   4. POST /api/upload/complete → record in database
//

import { get, set, del, keys } from 'idb-keyval';
import type { QueuedUpload } from '../types';
import { RETRY_DELAYS, MAX_CONCURRENT_UPLOADS } from '../constants';
import { compressPhoto } from './compress';

const QUEUE_PREFIX = 'upload_';

function queueKey(id: string): string {
  return `${QUEUE_PREFIX}${id}`;
}

export async function addToQueue(upload: QueuedUpload): Promise<void> {
  await set(queueKey(upload.id), upload);
}

export async function removeFromQueue(id: string): Promise<void> {
  await del(queueKey(id));
}

export async function getQueuedUpload(id: string): Promise<QueuedUpload | undefined> {
  return get(queueKey(id));
}

export async function getAllQueued(): Promise<QueuedUpload[]> {
  const allKeys = await keys();
  const uploadKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(QUEUE_PREFIX));
  const uploads: QueuedUpload[] = [];
  for (const key of uploadKeys) {
    const item = await get(key);
    if (item) uploads.push(item as QueuedUpload);
  }
  return uploads;
}

export async function getPendingCount(): Promise<number> {
  const all = await getAllQueued();
  return all.filter(u => u.status === 'queued' || u.status === 'uploading').length;
}

/** Remove items that have been stuck/failed for over 1 hour */
export async function cleanupStaleItems(): Promise<void> {
  const all = await getAllQueued();
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const item of all) {
    if (item.status === 'failed' && item.lastAttempt && new Date(item.lastAttempt).getTime() < oneHourAgo) {
      await removeFromQueue(item.id);
    }
  }
}

export async function updateQueueItem(id: string, updates: Partial<QueuedUpload>): Promise<void> {
  const item = await getQueuedUpload(id);
  if (item) {
    await set(queueKey(id), { ...item, ...updates });
  }
}

// ── Upload a single item ────────────────────────────────────────────
//
// 1. Compress photos (videos pass through)
// 2. POST /api/upload/sign → get Drive resumable upload session URI
// 3. PUT file directly to googleapis.com (CORS built-in, any size)
// 4. POST /api/upload/complete → record in database
//
async function processUpload(upload: QueuedUpload): Promise<boolean> {
  try {
    await updateQueueItem(upload.id, { status: 'uploading', lastAttempt: new Date().toISOString() });

    // Compress photos, pass videos through as-is
    let blob = upload.blob;
    const isPhoto = upload.metadata.mediaType === 'photo' || blob.type.startsWith('image/');
    if (isPhoto) {
      blob = await compressPhoto(blob);
    }
    const contentType = blob.type || (isPhoto ? 'image/jpeg' : 'video/webm');

    // Step 1: Get a Drive resumable upload session URI
    const signRes = await fetch('/api/upload/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: upload.metadata.filename,
        contentType,
        metadata: upload.metadata,
      }),
    });

    if (!signRes.ok) {
      const body = await signRes.text();
      throw new Error(`Sign failed: ${signRes.status} — ${body}`);
    }

    const { signedUrl, folderId } = await signRes.json();

    // Step 2: Upload directly to Google Drive (googleapis.com has CORS)
    const putRes = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(blob.size),
      },
      body: blob,
    });

    if (!putRes.ok) {
      const body = await putRes.text();
      throw new Error(`Drive upload failed: ${putRes.status} — ${body}`);
    }

    // Parse the Drive response to get the file ID
    let driveFileId: string | null = null;
    try {
      const driveData = await putRes.json();
      driveFileId = driveData.id || null;
    } catch {
      // Response might not be JSON — upload still succeeded
    }

    // Step 3: Record in database (best-effort)
    try {
      await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driveFileId,
          folderId,
          filename: upload.metadata.filename,
          contentType,
          metadata: upload.metadata,
        }),
      });
    } catch (dbErr) {
      // DB recording failed — file is still in Drive, that's OK
      console.warn('DB record failed (non-fatal):', dbErr);
    }

    // Success — remove from queue
    await removeFromQueue(upload.id);
    return true;
  } catch (err) {
    console.error('Upload error for', upload.id, err);
    const newRetryCount = upload.retryCount + 1;
    await updateQueueItem(upload.id, {
      status: 'failed',
      retryCount: newRetryCount,
      lastAttempt: new Date().toISOString(),
    });
    return false;
  }
}

// Process the queue (called periodically or on connectivity change)
let isProcessing = false;

export async function processQueue(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const allUploads = await getAllQueued();
    const pending = allUploads.filter(u => {
      if (u.status === 'uploading') return false;
      if (u.lastAttempt && u.retryCount > 0) {
        const delayIndex = Math.min(u.retryCount - 1, RETRY_DELAYS.length - 1);
        const delay = RETRY_DELAYS[delayIndex];
        const elapsed = Date.now() - new Date(u.lastAttempt).getTime();
        if (elapsed < delay) return false;
      }
      return true;
    });

    const batch = pending.slice(0, MAX_CONCURRENT_UPLOADS);
    await Promise.all(batch.map(processUpload));
  } finally {
    isProcessing = false;
  }
}

// Start periodic queue processing
let intervalId: ReturnType<typeof setInterval> | null = null;

export function startQueueProcessor(): void {
  if (intervalId) return;
  intervalId = setInterval(processQueue, 30_000);
  processQueue();
  window.addEventListener('online', () => processQueue());
}

export function stopQueueProcessor(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  window.removeEventListener('online', () => processQueue());
}
