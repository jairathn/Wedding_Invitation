// Video Message Screen — /app/video
// Full-screen camera with frosted glass prompt cards and proper record button

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { requestCamera, stopStream, getSupportedMimeType, checkCameraPermission } from '../lib/camera';
import { getStoredSession } from '../lib/session';
import { getRandomStructuredPrompts, MAX_PROMPTED_DURATION, MAX_FREEFORM_DURATION } from '../constants';
import type { VideoMode, CapturedMedia } from '../types';
import type { StructuredPrompt } from '../constants';

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

  const [prompts] = useState<StructuredPrompt[]>(() => getRandomStructuredPrompts(6));
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [recordedPrompts, setRecordedPrompts] = useState<CapturedMedia[]>([]);

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
      stream.getAudioTracks().forEach(track => { track.enabled = isMuted; });
      setIsMuted(!isMuted);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const media: CapturedMedia = {
        blob,
        type: 'video',
        duration: timer,
        promptAnswered: mode === 'prompted' ? prompts[currentPromptIndex].text : undefined,
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
    const allMedia = mode === 'prompted' ? [...recordedPrompts, latestMedia] : [latestMedia];
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

  const shufflePrompt = () => {
    let next = Math.floor(Math.random() * prompts.length);
    if (next === currentPromptIndex && prompts.length > 1) next = (next + 1) % prompts.length;
    setCurrentPromptIndex(next);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Shared frosted circle button style
  const glassBtn: React.CSSProperties = {
    width: 42, height: 42, borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div style={{
      height: '100vh', maxWidth: 430, margin: '0 auto',
      background: '#0c0a08', position: 'relative', overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column',
    }}>
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay playsInline muted
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
        }}
      />

      {/* Permission overlays */}
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
        </div>
      )}

      {permState === 'needs-permission' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 100%)', zIndex: 30,
          padding: '0 32px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(196,112,75,0.12) 0%, rgba(232,134,90,0.08) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C4704B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#2C2825' }}>Camera & Mic Access</p>
          <p style={{ margin: '10px 0 28px', fontSize: 15, color: '#8A8078', lineHeight: 1.5 }}>
            We need your camera and microphone to record video messages for Neil & Shriya.
          </p>
          <button onClick={() => initCamera(facingMode)} style={{
            padding: '14px 40px', borderRadius: 24,
            background: 'linear-gradient(135deg, #C4704B 0%, #E8865A 100%)',
            border: 'none', cursor: 'pointer', color: 'white',
            fontWeight: 600, fontSize: 16, fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 20px rgba(196,112,75,0.3)',
          }}>Allow Access</button>
          <button onClick={() => { stopStream(stream); navigate('/app/home'); }} style={{
            marginTop: 14, padding: '10px 24px', borderRadius: 20,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#A09890', fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
          }}>Maybe Later</button>
        </div>
      )}

      {permState === 'denied' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 100%)', zIndex: 30,
          padding: '0 32px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(212,114,106,0.12) 0%, rgba(212,114,106,0.06) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/><line x1="2" y1="2" x2="22" y2="22"/>
            </svg>
          </div>
          <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#2C2825' }}>Camera Blocked</p>
          <p style={{ margin: '10px 0 8px', fontSize: 15, color: '#8A8078', lineHeight: 1.5 }}>Camera access was denied. To enable it:</p>
          <div style={{ background: 'rgba(196,112,75,0.06)', borderRadius: 16, padding: '16px 20px', margin: '8px 0 24px', textAlign: 'left', width: '100%' }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, color: '#6B6158', lineHeight: 1.6 }}>1. Tap the lock/info icon in your browser's address bar</p>
            <p style={{ margin: '0 0 6px', fontSize: 13, color: '#6B6158', lineHeight: 1.6 }}>2. Find "Camera" and "Microphone" and change to "Allow"</p>
            <p style={{ margin: 0, fontSize: 13, color: '#6B6158', lineHeight: 1.6 }}>3. Refresh the page</p>
          </div>
          <button onClick={() => initCamera(facingMode)} style={{
            padding: '14px 40px', borderRadius: 24,
            background: 'linear-gradient(135deg, #C4704B 0%, #E8865A 100%)',
            border: 'none', cursor: 'pointer', color: 'white',
            fontWeight: 600, fontSize: 16, fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 20px rgba(196,112,75,0.3)',
          }}>Try Again</button>
          <button onClick={() => { stopStream(stream); navigate('/app/home'); }} style={{
            marginTop: 14, padding: '10px 24px', borderRadius: 20,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#A09890', fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
          }}>Go Back</button>
        </div>
      )}

      {/* Top gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 120,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)',
        zIndex: 5, pointerEvents: 'none',
      }} />
      {/* Bottom gradient */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 280,
        background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 100%)',
        zIndex: 5, pointerEvents: 'none',
      }} />

      {/* ═══ TOP CONTROLS ═══ */}
      <div style={{
        position: 'absolute', top: 16, left: 0, right: 0,
        padding: '0 16px', zIndex: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {/* Close */}
        <button onClick={() => { stopStream(stream); navigate('/app/home'); }} style={glassBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>

        {/* Mode toggle */}
        {!isRecording && (
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.08)',
            borderRadius: 24, padding: 3, backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {([
              { id: 'prompted' as const, label: 'Send a Message', icon: '💬' },
              { id: 'freeform' as const, label: 'Just Record', icon: '🔴' },
            ]).map((m) => (
              <button key={m.id} onClick={() => { setMode(m.id); }} style={{
                padding: '8px 16px', borderRadius: 21, border: 'none',
                background: mode === m.id ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: mode === m.id ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: mode === m.id ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 12 }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Right controls */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleMute} style={glassBtn}>
            {isMuted
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            }
          </button>
          <button onClick={toggleCamera} style={glassBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2-3h2l2 3h5a2 2 0 0 1 2 2v4"/>
              <path d="m18 22-3-3 3-3"/><path d="M22 19h-4"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ═══ RECORDING TIMER ═══ */}
      {isRecording && (
        <div style={{
          position: 'absolute', top: 76, left: '50%', transform: 'translateX(-50%)',
          zIndex: 20, display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(220,50,40,0.85)', backdropFilter: 'blur(10px)',
          padding: '6px 18px', borderRadius: 24,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: 'white',
            animation: 'recPulse 1.2s ease-in-out infinite',
          }} />
          <span style={{
            color: 'white', fontSize: 15, fontWeight: 600,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '0.03em',
          }}>{formatTime(timer)}</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>/ {formatTime(maxDuration)}</span>
        </div>
      )}

      {/* ═══ PROMPT CARD (Guided Mode) ═══ */}
      <AnimatePresence mode="wait">
        {mode === 'prompted' && !isRecording && cameraReady && (
          <motion.div
            key={currentPromptIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ position: 'absolute', top: '18%', left: 20, right: 20, zIndex: 15 }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(24px)',
              borderRadius: 24, padding: '28px 24px 24px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
            }}>
              {/* Top row: count + category */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{
                  fontSize: 10, color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
                }}>Prompt {currentPromptIndex + 1} of {prompts.length}</span>
                <span style={{
                  padding: '3px 10px', borderRadius: 10,
                  background: prompts[currentPromptIndex].category === 'fun'
                    ? 'rgba(232,134,90,0.2)' : 'rgba(196,141,160,0.2)',
                  fontSize: 10,
                  color: prompts[currentPromptIndex].category === 'fun' ? '#E8A87C' : '#D4A0B8',
                  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{prompts[currentPromptIndex].category}</span>
              </div>

              {/* Emoji + text */}
              <div style={{ textAlign: 'center', margin: '8px 0' }}>
                <span style={{ fontSize: 36, display: 'block', marginBottom: 16 }}>
                  {prompts[currentPromptIndex].emoji}
                </span>
                <p style={{
                  margin: 0, fontFamily: "'Playfair Display', serif",
                  fontSize: 24, fontWeight: 500, color: 'white',
                  lineHeight: 1.35, whiteSpace: 'pre-line',
                }}>{prompts[currentPromptIndex].text}</p>
              </div>

              {/* Pagination dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
                {prompts.map((_, i) => (
                  <button key={i} onClick={() => setCurrentPromptIndex(i)} style={{
                    width: i === currentPromptIndex ? 28 : 8, height: 8, borderRadius: 4,
                    background: i === currentPromptIndex ? '#C4704B' : 'rgba(255,255,255,0.2)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
                    padding: 0,
                  }} />
                ))}
              </div>
            </div>

            {/* Shuffle / Skip */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14 }}>
              <button onClick={shufflePrompt} style={{
                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500,
                padding: '8px 20px', borderRadius: 20, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>🔀</span> Shuffle
              </button>
              <button onClick={skipPrompt} style={{
                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500,
                padding: '8px 20px', borderRadius: 20, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                Skip <span>→</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review button when all prompts done */}
      {mode === 'prompted' && !isRecording && recordedPrompts.length > 0 && currentPromptIndex >= prompts.length && (
        <div style={{ position: 'absolute', bottom: 140, left: 20, right: 20, zIndex: 15 }}>
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
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #C4704B 0%, #E8865A 100%)',
              color: 'white', fontWeight: 600, fontSize: 16, borderRadius: 24,
              padding: '14px 0', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(196,112,75,0.35)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Review Messages <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </motion.button>
        </div>
      )}

      {/* ═══ GUEST NAME ═══ */}
      <div style={{
        position: 'absolute', bottom: 135, left: 0, right: 0,
        textAlign: 'center', zIndex: 15,
      }}>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          Recording as <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{guestName}</span>
        </p>
      </div>

      {/* ═══ RECORD BUTTON ═══ */}
      <div style={{
        position: 'absolute', bottom: 40, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 15,
      }}>
        <div style={{ position: 'relative' }}>
          {/* Pulsing ring when recording */}
          {isRecording && (
            <div style={{
              position: 'absolute', inset: -10,
              borderRadius: '50%',
              border: '3px solid rgba(220,50,40,0.3)',
              animation: 'recRing 2s ease-in-out infinite',
            }} />
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!cameraReady}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'transparent',
              border: `4px solid ${isRecording ? 'rgba(220,50,40,0.9)' : 'white'}`,
              cursor: cameraReady ? 'pointer' : 'default',
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.3s',
              boxShadow: isRecording
                ? '0 0 0 8px rgba(220,50,40,0.15), 0 0 60px rgba(220,50,40,0.2)'
                : '0 0 0 6px rgba(255,255,255,0.06)',
              opacity: cameraReady ? 1 : 0.4,
            }}
          >
            <div style={{
              width: isRecording ? 28 : 64,
              height: isRecording ? 28 : 64,
              borderRadius: isRecording ? 8 : '50%',
              background: isRecording
                ? 'white'
                : 'linear-gradient(135deg, #DC3228 0%, #C42820 100%)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isRecording ? 'none' : '0 4px 20px rgba(220,50,40,0.4)',
            }} />
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes recPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes recRing { 0% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.15); opacity: 0; } 100% { transform: scale(1); opacity: 0; } }
      `}</style>
    </div>
  );
}
