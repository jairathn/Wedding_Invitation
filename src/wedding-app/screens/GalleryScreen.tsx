// My Media Gallery — /app/gallery
// Instagram-style grid with fullscreen preview

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Film, X, Download, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
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

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#c9a84c]/40 border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full px-5 py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-serif text-[26px] font-semibold text-white">
          Gallery
        </h1>
        <p className="text-[13px] text-white/25 mt-1">
          {items.length} {items.length === 1 ? 'memory' : 'memories'} captured
        </p>
      </motion.div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-5">
            <Image size={28} className="text-white/15" strokeWidth={1.5} />
          </div>
          <p className="text-white/25 text-[15px] font-medium mb-1">No memories yet</p>
          <p className="text-white/15 text-[13px] mb-6">
            Capture your first photo or video
          </p>
          <button
            onClick={() => navigate('/app/photo')}
            className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-xl px-5 py-2.5 text-[13px] font-medium text-white/50 hover:text-white/70 hover:bg-white/[0.08] transition-all"
          >
            <Camera size={15} strokeWidth={1.5} />
            Open Camera
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-3 gap-[3px] rounded-xl overflow-hidden">
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setSelectedItem(item)}
              className="relative aspect-square overflow-hidden bg-white/[0.03] group"
            >
              {item.type === 'photo' ? (
                <img src={item.blobUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/[0.05] to-white/[0.02]">
                  <Film size={22} className="text-white/20" strokeWidth={1.5} />
                </div>
              )}

              {/* Upload status dot */}
              {item.uploadStatus !== 'complete' && (
                <span className={`absolute bottom-2 right-2 w-2 h-2 rounded-full ${
                  item.uploadStatus === 'uploading' ? 'bg-amber-400 animate-pulse' :
                  item.uploadStatus === 'failed' ? 'bg-red-400' :
                  'bg-amber-400'
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
            className="fixed inset-0 z-50 bg-[#050505]/98 flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 pt-[max(env(safe-area-inset-top),12px)]">
              <div>
                <p className="text-[12px] text-white/30">
                  {new Date(selectedItem.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadItem(selectedItem)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.06] text-white/50 hover:text-white transition-colors"
                >
                  <Download size={18} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.06] text-white/50 hover:text-white transition-colors"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
              {selectedItem.type === 'photo' ? (
                <motion.img
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
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
