// My Media Gallery — /app/gallery
// Instagram profile grid — bright, warm, clean

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Film, X, Download, Camera, Play } from 'lucide-react';
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

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  haldi: { label: 'Haldi', color: '#D4A853' },
  sangeet: { label: 'Sangeet', color: '#E8865A' },
  wedding_reception: { label: 'Wedding', color: '#2B5F8A' },
};

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
      <div className="min-h-full flex items-center justify-center bg-[#FEFCF9]">
        <div className="w-6 h-6 border-2 border-[#E8DDD3] border-t-[#C4704B] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full px-5 py-6 bg-[#FEFCF9]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="font-serif text-[24px] font-semibold text-[#2C2825]">
          My Gallery
        </h1>
        <p className="text-[13px] text-[#8A8078] mt-1">
          {items.length} {items.length === 1 ? 'memory' : 'memories'} captured
        </p>
      </motion.div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#F7F3ED] flex items-center justify-center mb-4">
            <Image size={28} className="text-[#B8AFA6]" strokeWidth={1.5} />
          </div>
          <p className="text-[#2C2825] text-[15px] font-medium mb-1">No memories yet</p>
          <p className="text-[#B8AFA6] text-[13px] mb-5">
            Capture your first photo or video
          </p>
          <button
            onClick={() => navigate('/app/photo')}
            className="flex items-center gap-2 bg-[#C4704B] text-white rounded-full px-6 py-3 text-[14px] font-semibold shadow-sm hover:bg-[#B5613E] transition-colors"
          >
            <Camera size={16} />
            Open Camera
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-3 gap-[2px] rounded-xl overflow-hidden">
          {items.map((item, i) => {
            const evt = EVENT_LABELS[item.event];
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedItem(item)}
                className="relative aspect-square overflow-hidden bg-[#F7F3ED] group"
              >
                {item.type === 'photo' ? (
                  <img src={item.blobUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#F7F3ED]">
                    <Play size={22} className="text-[#B8AFA6]" fill="#B8AFA6" strokeWidth={0} />
                  </div>
                )}

                {/* Event badge */}
                {evt && (
                  <span
                    className="absolute top-1.5 left-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: evt.color }}
                  >
                    {evt.label}
                  </span>
                )}

                {/* Upload status */}
                {item.uploadStatus !== 'complete' && (
                  <span className={`absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full ${
                    item.uploadStatus === 'uploading' ? 'bg-[#D4A853] animate-pulse' :
                    item.uploadStatus === 'failed' ? 'bg-[#D4726A]' :
                    'bg-[#D4A853]'
                  }`} />
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Fullscreen preview */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 pt-[max(env(safe-area-inset-top),12px)]">
              <p className="text-[12px] text-white/60">
                {new Date(selectedItem.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadItem(selectedItem)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"
                >
                  <Download size={18} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"
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
