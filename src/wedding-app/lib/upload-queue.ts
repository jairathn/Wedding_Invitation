// IndexedDB-based offline upload queue
//
// Upload flow:
//   1. Compress photos client-side (videos pass through as-is)
//   2. POST /api/upload/initiate with base64 file data
//   3. Server creates Drive folders + uploads to Drive + records in DB
//   All same-origin — no CORS, no signed URLs, no intermediate storage.
//

import { get, set, del, keys } from 'idb-keyval';
import type { QueuedUpload } from '../types';
import { RETRY_DELAYS, MAX_CONCURRENT_UPLOADS } from '../constants';

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
// 2. Convert blob to base64
// 3. POST to /api/upload/initiate (same origin — server uploads to Drive)
//
async function processUpload(upload: QueuedUpload): Promise<boolean> {
  const label = `[upload-queue] ${upload.id} "${upload.metadata.filename}"`;
  try {
    console.log(`${label} — starting (attempt ${upload.retryCount + 1}, blob ${(upload.blob.size / 1024).toFixed(1)} KB, type=${upload.blob.type})`);
    await updateQueueItem(upload.id, { status: 'uploading', lastAttempt: new Date().toISOString() });

    // Use the original blob as-is (no compression — keep full quality)
    const blob = upload.blob;
    const contentType = blob.type || 'application/octet-stream';

    // Convert blob to base64 for JSON transport
    console.log(`${label} — encoding to base64...`);
    const base64 = await blobToBase64(blob);
    console.log(`${label} — base64 length: ${(base64.length / 1024).toFixed(1)} KB`);

    // Single same-origin POST — server handles folders + Drive upload + DB
    console.log(`${label} — POSTing to /api/upload/initiate...`);
    const res = await fetch('/api/upload/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: base64,
        filename: upload.metadata.filename,
        contentType,
        metadata: upload.metadata,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Server responded ${res.status}: ${body}`);
    }

    const result = await res.json();
    console.log(`${label} — success! driveFileId=${result.driveFileId}`);

    // Success — remove from queue
    await removeFromQueue(upload.id);
    return true;
  } catch (err: any) {
    const newRetryCount = upload.retryCount + 1;
    const maxRetries = RETRY_DELAYS.length;
    console.error(`${label} — FAILED (attempt ${newRetryCount}/${maxRetries}):`, err?.message || err);
    await updateQueueItem(upload.id, {
      status: 'failed',
      retryCount: newRetryCount,
      lastAttempt: new Date().toISOString(),
    });
    return false;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      // Strip the "data:...;base64," prefix
      resolve(dataUrl.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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

    if (allUploads.length > 0) {
      console.log(`[upload-queue] Queue: ${allUploads.length} total, ${pending.length} ready to process`);
    }

    const batch = pending.slice(0, MAX_CONCURRENT_UPLOADS);
    if (batch.length > 0) {
      console.log(`[upload-queue] Processing batch of ${batch.length}...`);
    }
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
