// Review & Save Screen — /app/review
// Full-bleed media preview with sleek save actions

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Upload, Star, Camera, RotateCcw, Check } from 'lucide-react';
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

  // Save to device — uses native share sheet on mobile, falls back to download
  const saveToDevice = async () => {
    if (!capturedBlobs[currentIndex]) return;
    const blob = capturedBlobs[currentIndex].blob;
    const filename = generateFilename(currentMedia.type, eventSlug, guestName);

    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], filename, {
          type: currentMedia.type === 'photo' ? 'image/jpeg' : 'video/webm',
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Neil & Shriya\'s Wedding',
          });
          return;
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    const url = currentMedia.dataUrl || currentMedia.blobUrl || URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const saveToBoth = async () => {
    saveToDevice();
    await saveToAlbum();
  };

  const triggerSuccess = () => {
    setSaved(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('reviewMedia');
      delete (window as unknown as Record<string, unknown>).__capturedMedia;
    };
  }, []);

  if (!currentMedia) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#050505]">
        <p className="text-white/20">No media to review</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#050505]">
      <Confetti active={showConfetti} />

      {/* Media preview — full bleed */}
      <div className="flex-1 flex items-center justify-center p-4 pt-[max(env(safe-area-inset-top),16px)]">
        {currentMedia.type === 'photo' ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            src={currentMedia.dataUrl || currentMedia.blobUrl}
            alt="Captured photo"
            className="max-w-full max-h-[58vh] rounded-2xl object-contain"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
          />
        ) : (
          <motion.video
            ref={videoPreviewRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            src={currentMedia.blobUrl}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[58vh] rounded-2xl"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
          />
        )}
      </div>

      {/* Pagination dots */}
      {mediaItems.length > 1 && (
        <div className="flex justify-center gap-1.5 py-2">
          {mediaItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentIndex ? 'bg-[#c9a84c] w-4' : 'bg-white/15 w-1.5'
              }`}
            />
          ))}
        </div>
      )}

      {/* Prompt text */}
      {currentMedia.promptAnswered && (
        <p className="text-center text-[13px] text-white/25 italic px-8 py-2 font-serif">
          "{currentMedia.promptAnswered}"
        </p>
      )}

      {/* Save actions */}
      <div className="px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-4 space-y-2.5">
        {!saved ? (
          <>
            {/* Primary: Save to Both */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={saveToBoth}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2.5 bg-[#c9a84c] text-[#0a0a0a] font-sans font-semibold text-[15px] rounded-2xl py-4 disabled:opacity-50 transition-all shadow-lg shadow-[#c9a84c]/15 hover:shadow-[#c9a84c]/25"
            >
              <Star size={17} strokeWidth={2} />
              Save to Both
            </motion.button>

            {/* Secondary row */}
            <div className="flex gap-2.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={saveToAlbum}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-white/[0.05] border border-white/[0.06] text-white/60 font-sans font-medium text-[13px] rounded-xl py-3 disabled:opacity-50 hover:bg-white/[0.08] transition-all"
              >
                <Upload size={15} strokeWidth={1.5} />
                Album
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={saveToDevice}
                className="flex-1 flex items-center justify-center gap-2 bg-white/[0.05] border border-white/[0.06] text-white/60 font-sans font-medium text-[13px] rounded-xl py-3 hover:bg-white/[0.08] transition-all"
              >
                <Download size={15} strokeWidth={1.5} />
                Phone
              </motion.button>
            </div>
          </>
        ) : (
          <div className="space-y-2.5">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 py-4"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <Check size={16} className="text-emerald-400" />
              </div>
              <span className="text-white/60 font-medium text-[15px]">Saved</span>
            </motion.div>

            <div className="flex gap-2.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/app/photo')}
                className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] text-[#0a0a0a] font-sans font-semibold text-[14px] rounded-xl py-3.5"
              >
                <Camera size={16} />
                Take Another
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/app/home')}
                className="flex-1 flex items-center justify-center gap-2 bg-white/[0.05] border border-white/[0.06] text-white/50 font-sans font-medium text-[14px] rounded-xl py-3.5 hover:bg-white/[0.08] transition-all"
              >
                <RotateCcw size={15} strokeWidth={1.5} />
                Home
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
