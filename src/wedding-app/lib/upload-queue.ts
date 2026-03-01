// IndexedDB-based offline upload queue
// Uses idb-keyval for simple key-value storage

import { get, set, del, keys, values } from 'idb-keyval';
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
  // Only count items that are actively queued or uploading — not stale failures
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

/** Convert a Blob to a base64 string (without data URL prefix) */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(',')[1]); // strip "data:...;base64,"
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Upload a single item from the queue
async function processUpload(upload: QueuedUpload): Promise<boolean> {
  try {
    await updateQueueItem(upload.id, { status: 'uploading', lastAttempt: new Date().toISOString() });

    // Convert blob to base64 and send as JSON — the server's multipart
    // parser is a stub, so JSON is the reliable path.
    const base64 = await blobToBase64(upload.blob);
    const contentType = upload.blob.type || (upload.metadata.mediaType === 'video' ? 'video/webm' : 'image/jpeg');

    const res = await fetch('/api/upload/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: base64,
        metadata: upload.metadata,
        filename: upload.metadata.filename,
        contentType,
      }),
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status}`);
    }

    // Upload succeeded — remove from queue
    await removeFromQueue(upload.id);
    return true;
  } catch {
    // Upload failed — update retry count
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
      // Check if enough time has passed since last attempt based on retry delay
      if (u.lastAttempt && u.retryCount > 0) {
        const delayIndex = Math.min(u.retryCount - 1, RETRY_DELAYS.length - 1);
        const delay = RETRY_DELAYS[delayIndex];
        const elapsed = Date.now() - new Date(u.lastAttempt).getTime();
        if (elapsed < delay) return false;
      }
      return true;
    });

    // Process up to MAX_CONCURRENT_UPLOADS at a time
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
  // Process every 30 seconds
  intervalId = setInterval(processQueue, 30_000);
  // Also process immediately
  processQueue();
  // Listen for online events
  window.addEventListener('online', () => processQueue());
}

export function stopQueueProcessor(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  window.removeEventListener('online', () => processQueue());
}
