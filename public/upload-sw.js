// Service Worker for background upload sync
// Handles offline queue processing and connectivity changes

const CACHE_NAME = 'wedding-app-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PROCESS_QUEUE') {
    processUploadQueue();
  }
});

// Background sync (where supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'upload-queue') {
    event.waitUntil(processUploadQueue());
  }
});

// Process upload queue
async function processUploadQueue() {
  // Notify all clients to process their queues
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'FLUSH_QUEUE' });
  });
}

// Periodic background sync (where supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'upload-check') {
    event.waitUntil(processUploadQueue());
  }
});
