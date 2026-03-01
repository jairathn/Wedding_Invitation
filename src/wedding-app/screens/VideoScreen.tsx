// Video Message Screen — /app/video
// Full-screen camera — bright, party feel, Instagram Stories-style

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SwitchCamera, Mic, MicOff, ChevronRight, SkipForward, X } from 'lucide-react';
import { requestCamera, stopStream, getSupportedMimeType, generateFilename, checkCameraPermission } from '../lib/camera';
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
  const [permState, setPermState] = useState<'loading' | 'needs-permission' | 'denied' | 'ready'>('loading');

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
      setPermState('ready');
    } catch (err) {
      console.error('Camera error:', err);
      setPermState('denied');
    }
  }, [stream]);

  // Check permissions on mount, then init camera if already granted
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const perm = await checkCameraPermission();
      if (cancelled) return;
      if (perm === 'granted') {
        initCamera('user');
      } else if (perm === 'denied') {
        setPermState('denied');
      } else {
        setPermState('needs-permission');
      }
    })();
    return () => {
      cancelled = true;
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

        {/* Permission: loading */}
        {permState === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#1e1c1a', zIndex: 30,
          }}>
            <div style={{
              width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: '#C4704B', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Permission: needs-permission — friendly prompt */}
        {permState === 'needs-permission' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 100%)', zIndex: 30,
            padding: '0 32px', textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(196,112,75,0.12) 0%, rgba(232,134,90,0.08) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C4704B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15.2 3.9-2.2 2.2L10.8 3.9A2 2 0 0 0 9.4 3.4H4a2 2 0 0 0-2 2v13.2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1.4"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <p style={{
              margin: 0, fontFamily: "'Playfair Display', serif",
              fontSize: 22, fontWeight: 600, color: '#2C2825',
            }}>Camera & Mic Access</p>
            <p style={{
              margin: '10px 0 28px', fontSize: 15, color: '#8A8078', lineHeight: 1.5,
            }}>
              We need your camera and microphone to record video messages for Neil & Shriya. Your recordings stay on your device until you share them.
            </p>
            <button
              onClick={() => initCamera(facingMode)}
              style={{
                padding: '14px 40px', borderRadius: 24,
                background: 'linear-gradient(135deg, #C4704B 0%, #E8865A 100%)',
                border: 'none', cursor: 'pointer', color: 'white',
                fontWeight: 600, fontSize: 16, fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 4px 20px rgba(196,112,75,0.3)',
              }}
            >
              Allow Access
            </button>
            <button
              onClick={() => { stopStream(stream); navigate('/app/home'); }}
              style={{
                marginTop: 14, padding: '10px 24px', borderRadius: 20,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#A09890', fontSize: 14, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Maybe Later
            </button>
          </div>
        )}

        {/* Permission: denied — instructions */}
        {permState === 'denied' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 100%)', zIndex: 30,
            padding: '0 32px', textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(212,114,106,0.12) 0%, rgba(212,114,106,0.06) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
                <line x1="2" y1="2" x2="22" y2="22"/>
              </svg>
            </div>
            <p style={{
              margin: 0, fontFamily: "'Playfair Display', serif",
              fontSize: 22, fontWeight: 600, color: '#2C2825',
            }}>Camera Blocked</p>
            <p style={{
              margin: '10px 0 8px', fontSize: 15, color: '#8A8078', lineHeight: 1.5,
            }}>
              Camera access was denied. To enable it:
            </p>
            <div style={{
              background: 'rgba(196,112,75,0.06)', borderRadius: 16, padding: '16px 20px',
              margin: '8px 0 24px', textAlign: 'left', width: '100%',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 13, color: '#6B6158', lineHeight: 1.6 }}>
                1. Tap the lock/info icon in your browser's address bar
              </p>
              <p style={{ margin: '0 0 6px', fontSize: 13, color: '#6B6158', lineHeight: 1.6 }}>
                2. Find "Camera" and "Microphone" and change to "Allow"
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#6B6158', lineHeight: 1.6 }}>
                3. Refresh the page
              </p>
            </div>
            <button
              onClick={() => initCamera(facingMode)}
              style={{
                padding: '14px 40px', borderRadius: 24,
                background: 'linear-gradient(135deg, #C4704B 0%, #E8865A 100%)',
                border: 'none', cursor: 'pointer', color: 'white',
                fontWeight: 600, fontSize: 16, fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 4px 20px rgba(196,112,75,0.3)',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => { stopStream(stream); navigate('/app/home'); }}
              style={{
                marginTop: 14, padding: '10px 24px', borderRadius: 20,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#A09890', fontSize: 14, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Go Back
            </button>
          </div>
        )}

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
