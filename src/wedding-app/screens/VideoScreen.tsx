// Video Message Screen — /app/video
// Two modes: Prompted (with conversational prompts) and Freeform

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

  // Prompted mode state
  const [prompts] = useState(() => getRandomPrompts(3));
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [recordedPrompts, setRecordedPrompts] = useState<CapturedMedia[]>([]);

  const currentEvent = getCurrentEvent();
  const maxDuration = mode === 'prompted' ? MAX_PROMPTED_DURATION : MAX_FREEFORM_DURATION;
  const guestName = session?.guest ? `${session.guest.firstName} ${session.guest.lastName}` : 'Guest';

  // Initialize camera
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

  // Toggle camera
  const toggleCamera = async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    await initCamera(newFacing);
  };

  // Toggle mute
  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  // Start recording
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
          // All prompts done — go to review with all recordings
          navigateToReview(media);
        }
      } else {
        // Freeform — go directly to review
        navigateToReview(media);
      }
    };

    recorder.start(1000); // Collect data every second
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setTimer(0);

    // Start timer
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

  // Stop recording
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

  // Navigate to review screen
  const navigateToReview = (latestMedia: CapturedMedia) => {
    const allMedia = mode === 'prompted'
      ? [...recordedPrompts, latestMedia]
      : [latestMedia];

    // Store media in sessionStorage for review screen
    // Note: We store blob URLs since blobs can't be serialized
    const mediaForReview = allMedia.map(m => ({
      blobUrl: URL.createObjectURL(m.blob),
      type: m.type,
      duration: m.duration,
      promptAnswered: m.promptAnswered,
      filterApplied: undefined,
      // Store actual blob reference in a global for the review screen to grab
    }));

    // Use a global to pass blobs (can't serialize to sessionStorage)
    (window as unknown as Record<string, unknown>).__capturedMedia = allMedia;
    sessionStorage.setItem('reviewMedia', JSON.stringify(mediaForReview));
    stopStream(stream);
    navigate('/app/review');
  };

  // Skip prompt
  const skipPrompt = () => {
    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(prev => prev + 1);
    } else {
      // All prompts skipped/done
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

        {/* Cinematic letterbox bars */}
        <div className="absolute top-0 left-0 right-0 h-[12%] bg-gradient-to-b from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-gradient-to-t from-black/80 to-transparent" />

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] p-4">
          <button
            onClick={() => { stopStream(stream); navigate('/app/home'); }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white"
          >
            <X size={18} />
          </button>

          <p className="text-white/70 text-xs font-sans">{guestName}</p>

          <div className="flex gap-2">
            <button
              onClick={toggleMute}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white"
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={toggleCamera}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white"
            >
              <SwitchCamera size={16} />
            </button>
          </div>
        </div>

        {/* Mode toggle */}
        {!isRecording && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
            <div className="flex bg-black/40 rounded-full p-0.5">
              <button
                onClick={() => setMode('prompted')}
                className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
                  mode === 'prompted' ? 'bg-white/20 text-white' : 'text-white/50'
                }`}
              >
                Send a Message
              </button>
              <button
                onClick={() => setMode('freeform')}
                className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
                  mode === 'freeform' ? 'bg-white/20 text-white' : 'text-white/50'
                }`}
              >
                Just Record
              </button>
            </div>
          </div>
        )}

        {/* Prompt display */}
        <AnimatePresence mode="wait">
          {mode === 'prompted' && !isRecording && cameraReady && (
            <motion.div
              key={currentPromptIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-32 left-4 right-4 z-10"
            >
              <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-5">
                <p className="text-white font-serif text-xl leading-relaxed text-center">
                  {prompts[currentPromptIndex]}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-white/40 text-xs font-sans">
                    {currentPromptIndex + 1} of {prompts.length}
                  </span>
                  <button
                    onClick={skipPrompt}
                    className="flex items-center gap-1 text-white/50 text-xs font-sans hover:text-white/80 transition-colors"
                  >
                    Skip <SkipForward size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer display during recording */}
        {isRecording && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2">
            <div className="w-2.5 h-2.5 bg-[#c45c5c] rounded-full animate-pulse" />
            <span className="text-white font-mono text-sm">{formatTime(timer)}</span>
            <span className="text-white/40 text-xs">/ {formatTime(maxDuration)}</span>
          </div>
        )}

        {/* Prompted mode: next prompt indicator */}
        {mode === 'prompted' && !isRecording && recordedPrompts.length > 0 && currentPromptIndex >= prompts.length && (
          <div className="absolute bottom-32 left-4 right-4 z-10">
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
              className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] text-[#0a0a0a] font-sans font-semibold rounded-xl py-3"
            >
              Review Messages <ChevronRight size={18} />
            </motion.button>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-black px-4 py-6 pb-[env(safe-area-inset-bottom)] flex items-center justify-center">
        {/* Record button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!cameraReady}
          className="relative"
        >
          {/* Outer ring */}
          <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-colors ${
            isRecording ? 'border-[#c45c5c]' : 'border-white/80'
          }`}>
            {/* Inner circle / stop square */}
            <motion.div
              animate={{
                borderRadius: isRecording ? '6px' : '50%',
                width: isRecording ? 28 : 60,
                height: isRecording ? 28 : 60,
              }}
              transition={{ duration: 0.2 }}
              className="bg-[#c45c5c]"
              style={{ ...(isRecording ? {} : { animation: 'gentle-pulse 2s ease-in-out infinite' }) }}
            />
          </div>
        </button>
      </div>

      <style>{`
        @keyframes gentle-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
