// Review & Save Screen — /app/review
// Bright, warm save experience with terracotta CTAs

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Upload, Star, Camera, ArrowLeft, Check } from 'lucide-react';
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
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FEFCF9]">
        <p className="text-[#B8AFA6]">No media to review</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FEFCF9]">
      <Confetti active={showConfetti} />

      {/* Top bar */}
      <div className="flex items-center px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2">
        <button
          onClick={() => navigate('/app/home')}
          className="flex items-center gap-1 text-[#8A8078] hover:text-[#2C2825] transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="text-[13px] font-medium">Back</span>
        </button>
      </div>

      {/* Media preview */}
      <div className="flex-1 flex items-center justify-center px-5 py-4">
        {currentMedia.type === 'photo' ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            src={currentMedia.dataUrl || currentMedia.blobUrl}
            alt="Captured photo"
            className="max-w-full max-h-[55vh] rounded-2xl object-contain shadow-[0_8px_30px_rgba(44,40,37,0.12)]"
          />
        ) : (
          <motion.video
            ref={videoPreviewRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            src={currentMedia.blobUrl}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[55vh] rounded-2xl shadow-[0_8px_30px_rgba(44,40,37,0.12)]"
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
                i === currentIndex ? 'bg-[#C4704B] w-5' : 'bg-[#E8DDD3] w-1.5'
              }`}
            />
          ))}
        </div>
      )}

      {/* Prompt text */}
      {currentMedia.promptAnswered && (
        <p className="text-center text-[13px] text-[#8A8078] italic px-8 py-2">
          "{currentMedia.promptAnswered}"
        </p>
      )}

      {/* Save actions */}
      <div className="px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 space-y-2.5">
        {!saved ? (
          <>
            {/* Primary: Save to Both */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={saveToBoth}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2.5 bg-[#C4704B] text-white font-sans font-semibold text-[15px] rounded-full py-4 disabled:opacity-50 transition-all shadow-sm hover:bg-[#B5613E]"
            >
              <Star size={17} />
              Save to Both
              <span className="text-[11px] font-normal bg-[#D4A853] text-white px-2 py-0.5 rounded-full ml-1">Recommended</span>
            </motion.button>

            <p className="text-center text-[12px] text-[#B8AFA6] -mt-0.5 mb-1">
              Keep your memories safe — save everywhere!
            </p>

            {/* Secondary buttons */}
            <div className="flex gap-2.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={saveToAlbum}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#E8DDD3] text-[#2C2825] font-sans font-medium text-[13px] rounded-full py-3 disabled:opacity-50 hover:bg-[#F7F3ED] transition-all shadow-sm"
              >
                <Upload size={15} className="text-[#C4704B]" strokeWidth={1.5} />
                Wedding Album
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={saveToDevice}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#E8DDD3] text-[#2C2825] font-sans font-medium text-[13px] rounded-full py-3 hover:bg-[#F7F3ED] transition-all shadow-sm"
              >
                <Download size={15} className="text-[#2B5F8A]" strokeWidth={1.5} />
                My Phone
              </motion.button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 py-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#7A8B5C]/15 flex items-center justify-center">
                <Check size={20} className="text-[#7A8B5C]" />
              </div>
              <span className="text-[#2C2825] font-semibold text-[16px]">Saved!</span>
            </motion.div>

            <div className="flex gap-2.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/app/photo')}
                className="flex-1 flex items-center justify-center gap-2 bg-[#C4704B] text-white font-sans font-semibold text-[14px] rounded-full py-3.5 shadow-sm"
              >
                <Camera size={16} />
                Take Another
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/app/home')}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#E8DDD3] text-[#2C2825] font-sans font-medium text-[14px] rounded-full py-3.5 shadow-sm hover:bg-[#F7F3ED] transition-all"
              >
                Done
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
