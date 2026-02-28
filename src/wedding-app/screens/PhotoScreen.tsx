// Photo Booth Screen — /app/photo
// Full-screen camera with sleek filter carousel and capture

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SwitchCamera, X } from 'lucide-react';
import { requestCamera, stopStream, generateFilename } from '../lib/camera';
import { getStoredSession } from '../lib/session';
import { FILTERS, getFiltersForEvent, getCurrentEvent } from '../constants';
import type { FilterConfig, CapturedMedia } from '../types';

export default function PhotoScreen() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraReady, setCameraReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  const currentEvent = getCurrentEvent();
  const availableFilters = currentEvent
    ? getFiltersForEvent(currentEvent.slug)
    : FILTERS.filter(f => f.event === 'all');
  const [selectedFilter, setSelectedFilter] = useState<FilterConfig>(availableFilters[0]);

  const guestName = session?.guest ? `${session.guest.firstName} ${session.guest.lastName}` : 'Guest';

  const initCamera = useCallback(async (facing: 'user' | 'environment') => {
    try {
      if (stream) stopStream(stream);
      const newStream = await requestCamera(facing, false);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setCameraReady(true);
    } catch (err) {
      console.error('Camera error:', err);
    }
  }, [stream]);

  useEffect(() => {
    initCamera('user');
    return () => {
      if (stream) stopStream(stream);
      cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const draw = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.filter = selectedFilter.cssFilter || 'none';

      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = 'none';

      if (selectedFilter.textOverlay) {
        const { text, position, color } = selectedFilter.textOverlay;
        ctx.save();
        ctx.font = `${Math.floor(canvas.height * 0.028)}px 'Playfair Display', Georgia, serif`;
        ctx.fillStyle = color;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        const x = canvas.width * 0.04;
        const y = position === 'bottom' ? canvas.height * 0.95 : canvas.height * 0.05;
        ctx.fillText(text, x, y);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [selectedFilter, facingMode]);

  const toggleCamera = async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    await initCamera(newFacing);
  };

  const capturePhoto = () => {
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        takePhoto();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });

    const media: CapturedMedia = {
      blob,
      type: 'photo',
      dataUrl,
      filterApplied: selectedFilter.id,
    };

    (window as unknown as Record<string, unknown>).__capturedMedia = [media];
    sessionStorage.setItem('reviewMedia', JSON.stringify([{
      blobUrl: URL.createObjectURL(blob),
      dataUrl,
      type: 'photo',
      filterApplied: selectedFilter.id,
    }]));

    stopStream(stream);
    navigate('/app/review');
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Camera + canvas viewfinder */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-0"
        />

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Flash overlay */}
        {flash && <div className="absolute inset-0 bg-white z-30 pointer-events-none" />}

        {/* Countdown */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/30">
            <motion.span
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-white text-7xl font-serif font-bold"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
            >
              {countdown}
            </motion.span>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2">
          <button
            onClick={() => { stopStream(stream); navigate('/app/home'); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          <p className="text-white/40 text-[11px] font-medium tracking-wide">{guestName}</p>

          <button
            onClick={toggleCamera}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
          >
            <SwitchCamera size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Filter carousel */}
      <div className="bg-black/95 px-2 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
          {availableFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter)}
              className={`flex-shrink-0 snap-center flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                selectedFilter.id === filter.id
                  ? 'bg-white/[0.08]'
                  : 'bg-transparent hover:bg-white/[0.03]'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full border-2 transition-all duration-200 ${
                  selectedFilter.id === filter.id ? 'border-[#c9a84c] scale-105' : 'border-white/[0.08]'
                }`}
                style={{
                  background: filter.id === 'none'
                    ? 'linear-gradient(135deg, #555, #888)'
                    : filter.id === 'bw-classic'
                    ? 'linear-gradient(135deg, #333, #eee)'
                    : filter.id === 'golden-hour'
                    ? 'linear-gradient(135deg, #c9a84c, #e5c47a)'
                    : filter.id === 'vintage-warmth'
                    ? 'linear-gradient(135deg, #8B6914, #D4A853)'
                    : filter.id === 'film-grain'
                    ? 'linear-gradient(135deg, #9B8B6C, #C4B090)'
                    : filter.event === 'haldi'
                    ? 'linear-gradient(135deg, #D4A853, #E5C47A)'
                    : filter.event === 'sangeet'
                    ? 'linear-gradient(135deg, #9B59B6, #E74C9C)'
                    : filter.event === 'wedding_reception'
                    ? 'linear-gradient(135deg, #2E86AB, #C9A84C)'
                    : 'linear-gradient(135deg, #555, #888)',
                }}
              />
              <span className={`text-[9px] font-medium tracking-wide whitespace-nowrap transition-colors duration-200 ${
                selectedFilter.id === filter.id ? 'text-[#c9a84c]' : 'text-white/30'
              }`}>
                {filter.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Shutter button */}
      <div className="bg-black px-4 py-5 pb-[max(env(safe-area-inset-bottom),16px)] flex items-center justify-center">
        <motion.button
          onClick={capturePhoto}
          disabled={!cameraReady || countdown !== null}
          whileTap={{ scale: 0.92 }}
          className="w-[72px] h-[72px] rounded-full border-[3px] border-white/70 flex items-center justify-center disabled:opacity-30 transition-opacity"
        >
          <div className="w-[60px] h-[60px] rounded-full bg-white transition-transform" />
        </motion.button>
      </div>
    </div>
  );
}
