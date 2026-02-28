// Review & Save Screen — /app/review
// Shows captured media with save options

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Upload, Star, Camera, RotateCcw } from 'lucide-react';
import Confetti from '../components/Confetti';
import { getStoredSession } from '../lib/session';
import { addToQueue } from '../lib/upload-queue';
import { generateFilename } from '../lib/camera';
import { getCurrentEvent } from '../constants';
import type { CapturedMedia } from '../types';

interface ReviewMediaItem {
  blobUrl: string;
  dataUrl?: string;
  type: 'video' | 'photo';
  duration?: number;
  filterApplied?: string;
  promptAnswered?: string;
}

export default function ReviewScreen() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const [mediaItems, setMediaItems] = useState<ReviewMediaItem[]>([]);
  const [capturedBlobs, setCapturedBlobs] = useState<CapturedMedia[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const currentEvent = getCurrentEvent();
  const eventSlug = currentEvent?.slug || 'wedding_reception';
  const guestName = session?.guest ? `${session.guest.firstName} ${session.guest.lastName}` : 'Guest';

  useEffect(() => {
    // Load media from sessionStorage + global
    const stored = sessionStorage.getItem('reviewMedia');
    if (stored) {
      const items: ReviewMediaItem[] = JSON.parse(stored);
      setMediaItems(items);
    }
    const blobs = (window as unknown as Record<string, unknown>).__capturedMedia as CapturedMedia[] | undefined;
    if (blobs) {
      setCapturedBlobs(blobs);
    }

    if (!stored) {
      navigate('/app/home');
    }
  }, [navigate]);

  const currentMedia = mediaItems[currentIndex];

  // Save to device (download)
  const saveToDevice = () => {
    if (!currentMedia) return;
    const link = document.createElement('a');
    link.href = currentMedia.blobUrl || currentMedia.dataUrl || '';
    const ext = currentMedia.type === 'video' ? 'webm' : 'jpg';
    link.download = generateFilename(currentMedia.type, eventSlug, guestName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save to wedding album (queue for upload)
  const saveToAlbum = async () => {
    if (!capturedBlobs.length) return;
    setSaving(true);

    for (const media of capturedBlobs) {
      const filename = generateFilename(media.type, eventSlug, guestName);
      await addToQueue({
        id: crypto.randomUUID(),
        blob: media.blob,
        metadata: {
          guestId: session?.guestId || 0,
          guestName,
          eventSlug: eventSlug as 'haldi' | 'sangeet' | 'wedding_reception',
          mediaType: media.type,
          filename,
          filterApplied: media.filterApplied,
          promptAnswered: media.promptAnswered,
          capturedAt: new Date().toISOString(),
        },
        status: 'queued',
        retryCount: 0,
      });
    }

    setSaving(false);
    triggerSuccess();
  };

  // Save to both
  const saveToBoth = async () => {
    saveToDevice();
    await saveToAlbum();
  };

  const triggerSuccess = () => {
    setSaved(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('reviewMedia');
      delete (window as unknown as Record<string, unknown>).__capturedMedia;
    };
  }, []);

  if (!currentMedia) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-[#a0998c]">No media to review</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0a0a0a]">
      <Confetti active={showConfetti} />

      {/* Media preview */}
      <div className="flex-1 flex items-center justify-center p-4 pt-8">
        {currentMedia.type === 'photo' ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={currentMedia.dataUrl || currentMedia.blobUrl}
            alt="Captured photo"
            className="max-w-full max-h-[55vh] rounded-2xl object-contain shadow-2xl"
          />
        ) : (
          <motion.video
            ref={videoPreviewRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={currentMedia.blobUrl}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[55vh] rounded-2xl shadow-2xl"
          />
        )}
      </div>

      {/* Multiple items indicator */}
      {mediaItems.length > 1 && (
        <div className="flex justify-center gap-1.5 py-2">
          {mediaItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-[#c9a84c]' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      )}

      {/* Prompt answered */}
      {currentMedia.promptAnswered && (
        <p className="text-center text-sm text-[#a0998c] italic px-6 py-2 font-serif">
          "{currentMedia.promptAnswered}"
        </p>
      )}

      {/* Save options */}
      <div className="px-4 pb-8 pt-4 space-y-3">
        {!saved ? (
          <>
            {/* Save to Both — Recommended */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={saveToBoth}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] text-[#0a0a0a] font-sans font-semibold rounded-xl py-4 relative disabled:opacity-60"
            >
              <Star size={18} />
              Save to Both
              <span className="absolute right-3 text-xs font-normal opacity-70">Recommended</span>
            </motion.button>
            <p className="text-center text-xs text-[#a0998c] -mt-1 mb-1">
              Keep your memories safe — save to both the wedding album and your phone.
            </p>

            {/* Save to Album only */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={saveToAlbum}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a2e] border border-white/10 text-[#f5f0e8] font-sans font-medium rounded-xl py-3.5 disabled:opacity-60"
            >
              <Upload size={16} />
              Save to Wedding Album
            </motion.button>

            {/* Save to Phone only */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={saveToDevice}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a2e] border border-white/10 text-[#f5f0e8] font-sans font-medium rounded-xl py-3.5"
            >
              <Download size={16} />
              Save to My Phone
            </motion.button>
          </>
        ) : (
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <p className="text-[#7d9b76] font-serif text-xl font-semibold">Saved!</p>
              <p className="text-[#a0998c] text-sm mt-1">Your media is safely stored.</p>
            </motion.div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/app/photo')}
              className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] text-[#0a0a0a] font-sans font-semibold rounded-xl py-3.5"
            >
              <Camera size={16} />
              Take Another
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/app/home')}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a2e] border border-white/10 text-[#f5f0e8] font-sans font-medium rounded-xl py-3.5"
            >
              <RotateCcw size={16} />
              Go Home
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
