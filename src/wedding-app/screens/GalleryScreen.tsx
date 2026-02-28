// My Media Gallery — /app/gallery
// Grid of captured photos and videos for the current guest

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Film, X, Download } from 'lucide-react';
import { getAllQueued } from '../lib/upload-queue';
import { getStoredSession } from '../lib/session';
import type { QueuedUpload } from '../types';

interface MediaItem {
  id: string;
  type: 'video' | 'photo';
  blobUrl: string;
  event: string;
  timestamp: string;
  filter?: string;
  uploadStatus: 'queued' | 'uploading' | 'failed' | 'complete';
}

export default function GalleryScreen() {
  const session = getStoredSession();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      // Load from IndexedDB (queued uploads)
      const queued = await getAllQueued();
      const guestName = session?.guest ? `${session.guest.firstName} ${session.guest.lastName}` : '';

      const mediaItems: MediaItem[] = queued
        .filter(q => q.metadata.guestName === guestName)
        .map((q: QueuedUpload) => ({
          id: q.id,
          type: q.metadata.mediaType,
          blobUrl: URL.createObjectURL(q.blob),
          event: q.metadata.eventSlug,
          timestamp: q.metadata.capturedAt,
          filter: q.metadata.filterApplied,
          uploadStatus: q.status,
        }));

      setItems(mediaItems);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadItem = (item: MediaItem) => {
    const link = document.createElement('a');
    link.href = item.blobUrl;
    link.download = `${item.type}_${item.event}_${new Date(item.timestamp).getTime()}.${item.type === 'photo' ? 'jpg' : 'webm'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const EVENT_LABELS: Record<string, string> = {
    haldi: 'Haldi',
    sangeet: 'Sangeet',
    wedding_reception: 'Wedding',
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-2xl font-semibold text-[#f5f0e8] mb-2"
      >
        My Media
      </motion.h1>
      <p className="text-sm text-[#a0998c] mb-6">
        {items.length} item{items.length !== 1 ? 's' : ''} captured
      </p>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-full bg-[#1a1a2e] flex items-center justify-center mx-auto mb-4">
            <Image size={24} className="text-[#a0998c]" />
          </div>
          <p className="text-[#a0998c] font-serif italic text-lg">No photos or videos yet</p>
          <p className="text-[#a0998c]/60 text-sm mt-2">
            Head to the Photo Booth or Video Message to get started!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedItem(item)}
              className="relative aspect-square rounded-lg overflow-hidden bg-[#1a1a2e] group"
            >
              {item.type === 'photo' ? (
                <img src={item.blobUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e]">
                  <Film size={24} className="text-[#a0998c]" />
                </div>
              )}

              {/* Event badge */}
              <span className="absolute top-1.5 left-1.5 bg-black/60 text-[10px] text-white/80 px-1.5 py-0.5 rounded font-sans">
                {EVENT_LABELS[item.event] || item.event}
              </span>

              {/* Upload status */}
              {item.uploadStatus !== 'complete' && (
                <span className={`absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full ${
                  item.uploadStatus === 'uploading' ? 'bg-[#d4a843] animate-pulse' :
                  item.uploadStatus === 'failed' ? 'bg-[#c45c5c]' :
                  'bg-[#d4a843]'
                }`} />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Fullscreen preview */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-xs text-[#a0998c] font-sans">
                  {EVENT_LABELS[selectedItem.event] || selectedItem.event}
                </span>
                <p className="text-xs text-[#a0998c]/60">
                  {new Date(selectedItem.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadItem(selectedItem)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
              {selectedItem.type === 'photo' ? (
                <img
                  src={selectedItem.blobUrl}
                  alt=""
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <video
                  src={selectedItem.blobUrl}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-full rounded-lg"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
