// Video Message Screen — /app/video
// Full-screen camera — bright, party feel, Instagram Stories-style

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
      {/* Camera viewfinder — takes up most of the screen */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />

        {/* Soft gradient overlays for readability */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2">
          <button
            onClick={() => { stopStream(stream); navigate('/app/home'); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/25 backdrop-blur-sm text-white"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          <p className="text-white/70 text-[12px] font-medium">{guestName}</p>

          <div className="flex gap-2">
            <button
              onClick={toggleMute}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/25 backdrop-blur-sm text-white"
            >
              {isMuted ? <MicOff size={16} strokeWidth={1.5} /> : <Mic size={16} strokeWidth={1.5} />}
            </button>
            <button
              onClick={toggleCamera}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/25 backdrop-blur-sm text-white"
            >
              <SwitchCamera size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Mode toggle — Instagram Stories style */}
        {!isRecording && (
          <div className="absolute top-[68px] left-1/2 -translate-x-1/2 z-10">
            <div className="flex bg-black/25 backdrop-blur-md rounded-full p-0.5">
              <button
                onClick={() => setMode('prompted')}
                className={`px-5 py-2 rounded-full text-[12px] font-semibold transition-all ${
                  mode === 'prompted' ? 'bg-white text-[#2C2825]' : 'text-white/70'
                }`}
              >
                Send a Message
              </button>
              <button
                onClick={() => setMode('freeform')}
                className={`px-5 py-2 rounded-full text-[12px] font-semibold transition-all ${
                  mode === 'freeform' ? 'bg-white text-[#2C2825]' : 'text-white/70'
                }`}
              >
                Just Record
              </button>
            </div>
          </div>
        )}

        {/* Prompt card — frosted glass pill */}
        <AnimatePresence mode="wait">
          {mode === 'prompted' && !isRecording && cameraReady && (
            <motion.div
              key={currentPromptIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-28 left-4 right-4 z-10"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
                <p className="text-[#2C2825] font-serif text-lg leading-relaxed text-center">
                  {prompts[currentPromptIndex]}
                </p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[#B8AFA6] text-[11px] font-medium">
                    {currentPromptIndex + 1} of {prompts.length}
                  </span>
                  <button
                    onClick={skipPrompt}
                    className="flex items-center gap-1 text-[#C4704B] text-[12px] font-medium"
                  >
                    Skip <SkipForward size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer */}
        {isRecording && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-sm">
            <div className="w-2.5 h-2.5 bg-[#C4704B] rounded-full animate-pulse" />
            <span className="text-[#2C2825] font-mono text-[13px] font-medium">{formatTime(timer)}</span>
            <span className="text-[#B8AFA6] text-[11px]">/ {formatTime(maxDuration)}</span>
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
              className="w-full flex items-center justify-center gap-2 bg-[#C4704B] text-white font-sans font-semibold rounded-full py-3.5 shadow-lg"
            >
              Review Messages <ChevronRight size={18} />
            </motion.button>
          </div>
        )}
      </div>

      {/* Bottom controls — terracotta record button */}
      <div className="bg-black px-4 py-5 pb-[max(env(safe-area-inset-bottom),16px)] flex items-center justify-center">
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
                stroke="rgba(196,112,75,0.3)"
                strokeWidth="3"
              />
              <circle
                cx="44" cy="44" r="40"
                fill="none"
                stroke="#C4704B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
          )}
          {/* Outer ring */}
          <div className={`w-20 h-20 rounded-full border-[3px] flex items-center justify-center transition-all ${
            isRecording ? 'border-[#C4704B]' : 'border-white/70'
          }`}>
            <motion.div
              animate={{
                borderRadius: isRecording ? '8px' : '50%',
                width: isRecording ? 26 : 58,
                height: isRecording ? 26 : 58,
              }}
              transition={{ duration: 0.2 }}
              className="bg-[#C4704B]"
              style={!isRecording ? { boxShadow: '0 0 20px rgba(196,112,75,0.4)' } : {}}
            />
          </div>
        </button>
      </div>
    </div>
  );
}
