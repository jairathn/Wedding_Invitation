// IndexedDB-based offline upload queue
// Uses idb-keyval for simple key-value storage

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

// ── Upload a single item via the two-step resumable flow ────────────
//
// 1. POST metadata to /api/upload/initiate  → { uploadUrl, eventFolderId }
// 2. PUT file blob directly to Google Drive  → { id: driveFileId }
// 3. POST result to /api/upload/complete     → shortcut + DB record
//
// The file never passes through Vercel, so there is no 4.5 MB limit.

async function processUpload(upload: QueuedUpload): Promise<boolean> {
  try {
    await updateQueueItem(upload.id, { status: 'uploading', lastAttempt: new Date().toISOString() });

    // Compress photos before uploading
    let blob = upload.blob;
    const isPhoto = upload.metadata.mediaType === 'photo' || blob.type.startsWith('image/');
    if (isPhoto) {
      blob = await compressPhoto(blob);
    }

    const contentType = blob.type || (isPhoto ? 'image/jpeg' : 'video/webm');

    // Step 1: Get a resumable upload URL from our API
    const initRes = await fetch('/api/upload/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: upload.metadata.filename,
        contentType,
        guestName: upload.metadata.guestName,
        eventSlug: upload.metadata.eventSlug,
      }),
    });

    if (!initRes.ok) {
      throw new Error(`Initiate failed: ${initRes.status}`);
    }

    const { uploadUrl, eventFolderId } = await initRes.json();

    // Step 2: Upload the file directly to Google Drive
    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(blob.size),
      },
      body: blob,
    });

    if (!putRes.ok) {
      throw new Error(`Drive upload failed: ${putRes.status}`);
    }

    const driveFile = await putRes.json();

    // Step 3: Record in DB + create By-Event shortcut (best-effort)
    fetch('/api/upload/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driveFileId: driveFile.id,
        eventFolderId,
        filename: upload.metadata.filename,
        eventSlug: upload.metadata.eventSlug,
        guestId: upload.metadata.guestId,
        mediaType: upload.metadata.mediaType,
        filterApplied: upload.metadata.filterApplied,
        promptAnswered: upload.metadata.promptAnswered,
      }),
    }).catch(err => console.warn('Upload complete call failed (non-fatal):', err));

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
