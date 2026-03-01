// IndexedDB-based offline upload queue
//
// Upload flow — two paths:
//
//   PHOTOS (< 4.5 MB):
//     1. Convert blob to base64
//     2. POST /api/upload/initiate with file data
//     3. Server uploads to Drive + records in DB
//
//   VIDEOS (any size):
//     1. POST /api/upload/initiate with totalSize only (no file data)
//     2. Server creates Drive folders, returns a resumable session URI
//     3. Client PUTs chunks directly to Google Drive (bypasses Vercel)
//     4. POST /api/upload/complete to record in DB
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

async function processUpload(upload: QueuedUpload): Promise<boolean> {
  const isVideo = upload.metadata.mediaType === 'video';
  return isVideo ? processVideoUpload(upload) : processPhotoUpload(upload);
}

// ── Photo: base64 → POST to Vercel → Drive ──────────────────────────

async function processPhotoUpload(upload: QueuedUpload): Promise<boolean> {
  const label = `[upload-queue] ${upload.id} "${upload.metadata.filename}"`;
  try {
    console.log(`${label} — PHOTO starting (attempt ${upload.retryCount + 1}, blob ${(upload.blob.size / 1024).toFixed(1)} KB, type=${upload.blob.type})`);
    await updateQueueItem(upload.id, { status: 'uploading', lastAttempt: new Date().toISOString() });

    const blob = upload.blob;
    const contentType = blob.type || 'application/octet-stream';

    console.log(`${label} — encoding to base64...`);
    const base64 = await blobToBase64(blob);
    console.log(`${label} — base64 length: ${(base64.length / 1024).toFixed(1)} KB`);

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

    await removeFromQueue(upload.id);
    return true;
  } catch (err: any) {
    const newRetryCount = upload.retryCount + 1;
    const maxRetries = RETRY_DELAYS.length;
    console.error(`${label} — PHOTO FAILED (attempt ${newRetryCount}/${maxRetries}):`, err?.message || err);
    await updateQueueItem(upload.id, {
      status: 'failed',
      retryCount: newRetryCount,
      lastAttempt: new Date().toISOString(),
    });
    return false;
  }
}

// ── Video: metadata → Vercel, chunks → Google Drive directly ────────
//
// Google Drive resumable upload protocol:
//   - PUT chunks to the session URI
//   - Each chunk must be a multiple of 256 KB (except the last)
//   - Header: Content-Range: bytes start-end/total
//   - Final chunk returns 200 with file metadata
//
const CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB per chunk (multiple of 256 KB)

async function processVideoUpload(upload: QueuedUpload): Promise<boolean> {
  const label = `[upload-queue] ${upload.id} "${upload.metadata.filename}"`;
  try {
    const blob = upload.blob;
    const contentType = blob.type || 'video/webm';
    const totalSize = blob.size;

    console.log(`${label} — VIDEO starting (attempt ${upload.retryCount + 1}, ${(totalSize / (1024 * 1024)).toFixed(1)} MB, type=${contentType})`);
    await updateQueueItem(upload.id, { status: 'uploading', lastAttempt: new Date().toISOString() });

    // Step 1: Get resumable session URI from our server (tiny JSON payload)
    console.log(`${label} — requesting resumable session...`);
    const initRes = await fetch('/api/upload/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: upload.metadata.filename,
        contentType,
        totalSize,
        metadata: upload.metadata,
      }),
    });

    if (!initRes.ok) {
      const body = await initRes.text();
      throw new Error(`Session init failed ${initRes.status}: ${body}`);
    }

    const { sessionUri, eventFolderId } = await initRes.json();
    console.log(`${label} — got session URI, uploading ${Math.ceil(totalSize / CHUNK_SIZE)} chunks...`);

    // Step 2: Upload chunks directly to Google Drive
    let offset = 0;
    let driveFileId: string | undefined;

    while (offset < totalSize) {
      const end = Math.min(offset + CHUNK_SIZE, totalSize);
      const chunk = blob.slice(offset, end);
      const chunkNum = Math.floor(offset / CHUNK_SIZE) + 1;
      const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);

      console.log(`${label} — chunk ${chunkNum}/${totalChunks} (bytes ${offset}-${end - 1}/${totalSize})`);

      const putRes = await fetch(sessionUri, {
        method: 'PUT',
        headers: {
          'Content-Length': String(end - offset),
          'Content-Range': `bytes ${offset}-${end - 1}/${totalSize}`,
        },
        body: chunk,
      });

      if (putRes.status === 200 || putRes.status === 201) {
        // Final chunk — upload complete
        const result = await putRes.json();
        driveFileId = result.id;
        console.log(`${label} — final chunk done, driveFileId=${driveFileId}`);
      } else if (putRes.status === 308) {
        // Chunk accepted, more to go — check Range header for actual offset
        const range = putRes.headers.get('Range');
        if (range) {
          const match = range.match(/bytes=0-(\d+)/);
          if (match) {
            offset = parseInt(match[1], 10) + 1;
            continue;
          }
        }
      } else {
        const body = await putRes.text();
        throw new Error(`Chunk upload failed ${putRes.status}: ${body}`);
      }

      offset = end;
    }

    if (!driveFileId) {
      throw new Error('Upload completed but no file ID returned');
    }

    // Step 3: Record in database via our server
    console.log(`${label} — recording in database...`);
    const completeRes = await fetch('/api/upload/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driveFileId,
        folderId: eventFolderId,
        filename: upload.metadata.filename,
        metadata: upload.metadata,
      }),
    });

    if (!completeRes.ok) {
      console.warn(`${label} — DB record failed (non-fatal): ${completeRes.status}`);
    } else {
      console.log(`${label} — DB record complete`);
    }

    console.log(`${label} — VIDEO upload success!`);
    await removeFromQueue(upload.id);
    return true;
  } catch (err: any) {
    const newRetryCount = upload.retryCount + 1;
    const maxRetries = RETRY_DELAYS.length;
    console.error(`${label} — VIDEO FAILED (attempt ${newRetryCount}/${maxRetries}):`, err?.message || err);
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
