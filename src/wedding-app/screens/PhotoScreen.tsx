// Photo Booth Screen — /app/photo
// Full-screen camera with filter carousel and capture

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

  // Initialize camera
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

  // Draw filtered frame to canvas
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

      // Apply CSS filter
      ctx.filter = selectedFilter.cssFilter || 'none';

      // Mirror for front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0);

      // Reset transform
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = 'none';

      // Draw text overlay if present
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

  // Toggle camera
  const toggleCamera = async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    await initCamera(newFacing);
  };

  // Capture photo with countdown
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

  // Take the actual photo
  const takePhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Convert to blob
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

    // Pass to review screen
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
        {/* Hidden video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-0"
        />

        {/* Filtered canvas (visible) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Flash overlay */}
        {flash && <div className="absolute inset-0 bg-white z-30 pointer-events-none" />}

        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/30">
            <motion.span
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-white text-8xl font-serif font-bold"
            >
              {countdown}
            </motion.span>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] p-4">
          <button
            onClick={() => { stopStream(stream); navigate('/app/home'); }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white"
          >
            <X size={18} />
          </button>

          <p className="text-white/70 text-xs font-sans">{guestName}</p>

          <button
            onClick={toggleCamera}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white"
          >
            <SwitchCamera size={16} />
          </button>
        </div>
      </div>

      {/* Filter carousel */}
      <div className="bg-black/90 px-2 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
          {availableFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter)}
              className={`flex-shrink-0 snap-center flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                selectedFilter.id === filter.id
                  ? 'bg-[#c9a84c]/20 ring-1 ring-[#c9a84c]'
                  : 'bg-white/5'
              }`}
            >
              {/* Filter preview — colored circle representing the filter */}
              <div
                className="w-10 h-10 rounded-full border border-white/10"
                style={{
                  background: filter.id === 'none'
                    ? 'linear-gradient(135deg, #666, #999)'
                    : filter.id === 'bw-classic'
                    ? 'linear-gradient(135deg, #333, #fff)'
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
                    : 'linear-gradient(135deg, #666, #999)',
                }}
              />
              <span className={`text-[10px] font-sans whitespace-nowrap ${
                selectedFilter.id === filter.id ? 'text-[#c9a84c]' : 'text-white/60'
              }`}>
                {filter.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Shutter button */}
      <div className="bg-black px-4 py-5 pb-[env(safe-area-inset-bottom)] flex items-center justify-center">
        <motion.button
          onClick={capturePhoto}
          disabled={!cameraReady || countdown !== null}
          whileTap={{ scale: 0.93 }}
          className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center disabled:opacity-40"
        >
          <div className="w-16 h-16 rounded-full bg-white" />
        </motion.button>
      </div>
    </div>
  );
}
