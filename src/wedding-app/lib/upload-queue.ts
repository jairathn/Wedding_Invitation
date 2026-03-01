// IndexedDB-based offline upload queue
// Uses idb-keyval for simple key-value storage

import { get, set, del, keys } from 'idb-keyval';
import type { QueuedUpload } from '../types';
import { RETRY_DELAYS, MAX_CONCURRENT_UPLOADS } from '../constants';
import { compressPhoto } from './compress';

const QUEUE_PREFIX = 'upload_';

// Chunk size for video uploads — must be a multiple of 256 KB per Google
// Drive requirements.  3 MB binary → ~4 MB base64 → fits in Vercel's 4.5 MB
// request body limit.
const VIDEO_CHUNK_SIZE = 3 * 1024 * 1024; // 3 MB

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

/** Convert a Blob slice to a base64 string */
function sliceToBase64(blob: Blob, start: number, end: number): Promise<string> {
  return blobToBase64(blob.slice(start, end));
}

// ── Photo upload: compress → base64 → single POST ───────────────────

async function uploadPhoto(upload: QueuedUpload): Promise<boolean> {
  const blob = await compressPhoto(upload.blob);
  const contentType = blob.type || 'image/jpeg';
  const base64 = await blobToBase64(blob);

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
    const body = await res.text();
    throw new Error(`Photo upload failed: ${res.status} — ${body}`);
  }
  return true;
}

// ── Video upload: initiate session → send chunks → complete ─────────

async function uploadVideo(upload: QueuedUpload): Promise<boolean> {
  const blob = upload.blob;
  const totalSize = blob.size;
  const contentType = blob.type || 'video/webm';

  // Step 1: Initiate — server creates folders + starts resumable session
  const initRes = await fetch('/api/upload/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      totalSize,
      metadata: upload.metadata,
      filename: upload.metadata.filename,
      contentType,
    }),
  });

  if (!initRes.ok) {
    const body = await initRes.text();
    throw new Error(`Video initiate failed: ${initRes.status} — ${body}`);
  }

  const { sessionUri, eventFolderId } = await initRes.json();

  // Step 2: Send chunks
  let offset = 0;
  let driveFileId: string | null = null;

  while (offset < totalSize) {
    const end = Math.min(offset + VIDEO_CHUNK_SIZE, totalSize);
    const chunkBase64 = await sliceToBase64(blob, offset, end);

    const chunkRes = await fetch('/api/upload/chunk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionUri,
        chunk: chunkBase64,
        offset,
        totalSize,
      }),
    });

    if (!chunkRes.ok) {
      const body = await chunkRes.text();
      throw new Error(`Chunk upload failed at offset ${offset}: ${chunkRes.status} — ${body}`);
    }

    const result = await chunkRes.json();

    if (result.complete) {
      driveFileId = result.driveFileId;
      break;
    }

    offset = result.nextOffset;
  }

  // Step 3: Record in DB + create By-Event shortcut (best-effort)
  if (driveFileId) {
    fetch('/api/upload/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driveFileId,
        eventFolderId,
        filename: upload.metadata.filename,
        eventSlug: upload.metadata.eventSlug,
        guestId: upload.metadata.guestId,
        mediaType: upload.metadata.mediaType,
        filterApplied: upload.metadata.filterApplied,
        promptAnswered: upload.metadata.promptAnswered,
      }),
    }).catch(err => console.warn('Upload complete call failed (non-fatal):', err));
  }

  return true;
}

// ── Process a single queue item ─────────────────────────────────────

async function processUpload(upload: QueuedUpload): Promise<boolean> {
  try {
    await updateQueueItem(upload.id, { status: 'uploading', lastAttempt: new Date().toISOString() });

    const isPhoto = upload.metadata.mediaType === 'photo' || upload.blob.type.startsWith('image/');

    if (isPhoto) {
      await uploadPhoto(upload);
    } else {
      await uploadVideo(upload);
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
