// Video Message Screen — /app/video
// Sleek full-screen camera with mode toggle and prompt cards

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SwitchCamera, Mic, MicOff, ChevronRight, SkipForward, X } from 'lucide-react';
import { requestCamera, stopStream, getSupportedMimeType, generateFilename } from '../lib/camera';
import { getStoredSession } from '../lib/session';
import { getRandomPrompts, MAX_PROMPTED_DURATION, MAX_FREEFORM_DURATION, getCurrentEvent } from '../constants';
import type { VideoMode, CapturedMedia } from '../types';

export default function VideoScreen() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<VideoMode>('prompted');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  const [prompts] = useState(() => getRandomPrompts(3));
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [recordedPrompts, setRecordedPrompts] = useState<CapturedMedia[]>([]);

  const currentEvent = getCurrentEvent();
  const maxDuration = mode === 'prompted' ? MAX_PROMPTED_DURATION : MAX_FREEFORM_DURATION;
  const guestName = session?.guest ? `${session.guest.firstName} ${session.guest.lastName}` : 'Guest';

  const initCamera = useCallback(async (facing: 'user' | 'environment') => {
    try {
      if (stream) stopStream(stream);
      const newStream = await requestCamera(facing, true);
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCamera = async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    await initCamera(newFacing);
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 5_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const media: CapturedMedia = {
        blob,
        type: 'video',
        duration: timer,
        promptAnswered: mode === 'prompted' ? prompts[currentPromptIndex] : undefined,
      };

      if (mode === 'prompted') {
        setRecordedPrompts(prev => [...prev, media]);
        if (currentPromptIndex < prompts.length - 1) {
          setCurrentPromptIndex(prev => prev + 1);
        } else {
          navigateToReview(media);
        }
      } else {
        navigateToReview(media);
      }
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setTimer(0);

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev >= maxDuration - 1) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const navigateToReview = (latestMedia: CapturedMedia) => {
    const allMedia = mode === 'prompted'
      ? [...recordedPrompts, latestMedia]
      : [latestMedia];

    const mediaForReview = allMedia.map(m => ({
      blobUrl: URL.createObjectURL(m.blob),
      type: m.type,
      duration: m.duration,
      promptAnswered: m.promptAnswered,
      filterApplied: undefined,
    }));

    (window as unknown as Record<string, unknown>).__capturedMedia = allMedia;
    sessionStorage.setItem('reviewMedia', JSON.stringify(mediaForReview));
    stopStream(stream);
    navigate('/app/review');
  };

  const skipPrompt = () => {
    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(prev => prev + 1);
    } else {
      if (recordedPrompts.length > 0) {
        (window as unknown as Record<string, unknown>).__capturedMedia = recordedPrompts;
        const mediaForReview = recordedPrompts.map(m => ({
          blobUrl: URL.createObjectURL(m.blob),
          type: m.type,
          duration: m.duration,
          promptAnswered: m.promptAnswered,
        }));
        sessionStorage.setItem('reviewMedia', JSON.stringify(mediaForReview));
        stopStream(stream);
        navigate('/app/review');
      } else {
        navigate('/app/home');
      }
    }
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = timer / maxDuration;

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Camera viewfinder */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />

        {/* Cinematic gradient overlays */}
        <div className="absolute top-0 left-0 right-0 h-[15%] bg-gradient-to-b from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-t from-black/70 to-transparent" />

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2">
          <button
            onClick={() => { stopStream(stream); navigate('/app/home'); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          <p className="text-white/40 text-[11px] font-medium tracking-wide">{guestName}</p>

          <div className="flex gap-2">
            <button
              onClick={toggleMute}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
            >
              {isMuted ? <MicOff size={16} strokeWidth={1.5} /> : <Mic size={16} strokeWidth={1.5} />}
            </button>
            <button
              onClick={toggleCamera}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
            >
              <SwitchCamera size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Mode toggle pill */}
        {!isRecording && (
          <div className="absolute top-[70px] left-1/2 -translate-x-1/2 z-10">
            <div className="flex bg-black/30 backdrop-blur-md rounded-full p-0.5 border border-white/[0.06]">
              <button
                onClick={() => setMode('prompted')}
                className={`px-5 py-2 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-200 ${
                  mode === 'prompted' ? 'bg-white/15 text-white' : 'text-white/40'
                }`}
              >
                Prompted
              </button>
              <button
                onClick={() => setMode('freeform')}
                className={`px-5 py-2 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-200 ${
                  mode === 'freeform' ? 'bg-white/15 text-white' : 'text-white/40'
                }`}
              >
                Freeform
              </button>
            </div>
          </div>
        )}

        {/* Prompt card */}
        <AnimatePresence mode="wait">
          {mode === 'prompted' && !isRecording && cameraReady && (
            <motion.div
              key={currentPromptIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-28 left-4 right-4 z-10"
            >
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06]">
                <p className="text-white font-serif text-lg leading-relaxed text-center">
                  {prompts[currentPromptIndex]}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-white/25 text-[11px] font-medium tracking-wide">
                    {currentPromptIndex + 1} / {prompts.length}
                  </span>
                  <button
                    onClick={skipPrompt}
                    className="flex items-center gap-1 text-white/30 text-[11px] font-medium hover:text-white/60 transition-colors"
                  >
                    Skip <SkipForward size={11} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer during recording */}
        {isRecording && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/[0.06]">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-mono text-[13px]">{formatTime(timer)}</span>
            <span className="text-white/25 text-[11px]">/ {formatTime(maxDuration)}</span>
          </div>
        )}

        {/* Review button when all prompts done */}
        {mode === 'prompted' && !isRecording && recordedPrompts.length > 0 && currentPromptIndex >= prompts.length && (
          <div className="absolute bottom-28 left-4 right-4 z-10">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                (window as unknown as Record<string, unknown>).__capturedMedia = recordedPrompts;
                const mediaForReview = recordedPrompts.map(m => ({
                  blobUrl: URL.createObjectURL(m.blob),
                  type: m.type,
                  duration: m.duration,
                  promptAnswered: m.promptAnswered,
                }));
                sessionStorage.setItem('reviewMedia', JSON.stringify(mediaForReview));
                stopStream(stream);
                navigate('/app/review');
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] text-[#0a0a0a] font-sans font-semibold rounded-2xl py-3.5 shadow-lg shadow-[#c9a84c]/20"
            >
              Review Messages <ChevronRight size={18} />
            </motion.button>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-black px-4 py-6 pb-[max(env(safe-area-inset-bottom),16px)] flex items-center justify-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!cameraReady}
          className="relative disabled:opacity-40"
        >
          {/* Progress ring */}
          {isRecording && (
            <svg className="absolute -inset-1 w-[88px] h-[88px] -rotate-90">
              <circle
                cx="44" cy="44" r="40"
                fill="none"
                stroke="rgba(196,92,92,0.3)"
                strokeWidth="3"
              />
              <circle
                cx="44" cy="44" r="40"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
          )}
          {/* Outer ring */}
          <div className={`w-20 h-20 rounded-full border-[3px] flex items-center justify-center transition-all duration-200 ${
            isRecording ? 'border-red-500/60' : 'border-white/60'
          }`}>
            {/* Inner shape */}
            <motion.div
              animate={{
                borderRadius: isRecording ? '8px' : '50%',
                width: isRecording ? 26 : 58,
                height: isRecording ? 26 : 58,
              }}
              transition={{ duration: 0.2 }}
              className={isRecording ? 'bg-red-500' : 'bg-red-500/90'}
            />
          </div>
        </button>
      </div>
    </div>
  );
}
