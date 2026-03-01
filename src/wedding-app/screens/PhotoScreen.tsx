// Photo Booth Screen — /app/photo
// Dual mode: real-time Filters (camera) + AI Portrait (capture → pick → generating → reveal)

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestCamera, stopStream, capturePhotoFromFilteredCanvas, checkCameraPermission } from '../lib/camera';
import { getStoredSession } from '../lib/session';
import { PHOTO_FILTERS } from '../lib/filters';
import {
  AI_PORTRAIT_STYLES,
  canGeneratePortrait,
  getRemainingPortraits,
  incrementPortraitCount,
  generateAIPortrait,
  preparePhotoForAI,
  savePortraitToDrive,
} from '../lib/ai-portrait';
import type { AIPortraitStyle, AIPortraitStep } from '../lib/ai-portrait';
import type { CapturedMedia } from '../types';

type SaveTarget = 'device' | 'drive' | 'both';

type TabMode = 'filters' | 'ai-portrait';

export default function PhotoScreen() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraReady, setCameraReady] = useState(false);
  const [permState, setPermState] = useState<'loading' | 'needs-permission' | 'denied' | 'ready'>('loading');
  const [flash, setFlash] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Tab mode
  const [tabMode, setTabMode] = useState<TabMode>('filters');

  // Filter mode state
  const [activeFilter, setActiveFilter] = useState('none');

  // AI Portrait state
  const [aiStep, setAiStep] = useState<AIPortraitStep>('capture');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<AIPortraitStyle | null>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<Array<{
    x: number; y: number; vx: number; vy: number; color: string; size: number;
  }>>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedTo, setSavedTo] = useState<SaveTarget | null>(null);

  const guestName = session?.guest
    ? `${session.guest.firstName} ${session.guest.lastName}`
    : 'Guest';

  // ── Camera init ──
  const initCamera = useCallback(async (facing: 'user' | 'environment') => {
    try {
      if (stream) stopStream(stream);
      const newStream = await requestCamera(facing, false);
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
      cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Live canvas render with filter ──
  useEffect(() => {
    // Only render canvas loop in filter mode or during AI capture
    if (tabMode === 'ai-portrait' && aiStep !== 'capture') return;

    const filter = tabMode === 'filters'
      ? (PHOTO_FILTERS.find(f => f.id === activeFilter) || PHOTO_FILTERS[0])
      : PHOTO_FILTERS[0]; // AI portrait capture uses original (no filter)
    const mirror = facingMode === 'user';

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

      filter.render(ctx, canvas, video, mirror);
      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [activeFilter, facingMode, tabMode, aiStep]);

  // ── Camera actions ──
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
        if (tabMode === 'ai-portrait') {
          takePhotoForAI();
        } else {
          takePhotoForFilter();
        }
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const takePhotoForFilter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    const result = capturePhotoFromFilteredCanvas(canvas);
    if (!result) return;

    const media: CapturedMedia = {
      blob: result.blob,
      type: 'photo',
      dataUrl: result.dataUrl,
      filterApplied: activeFilter,
    };

    (window as unknown as Record<string, unknown>).__capturedMedia = [media];
    sessionStorage.setItem('reviewMedia', JSON.stringify([{
      blobUrl: URL.createObjectURL(result.blob),
      dataUrl: result.dataUrl,
      type: 'photo',
      filterApplied: activeFilter,
    }]));

    stopStream(stream);
    navigate('/app/review');
  };

  const takePhotoForAI = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    const dataUrl = preparePhotoForAI(canvas);
    setCapturedPhoto(dataUrl);
    setAiStep('pick');
  };

  // ── AI Portrait: generate ──
  const startGeneration = async (style: AIPortraitStyle) => {
    if (!capturedPhoto || !canGeneratePortrait()) return;

    setSelectedStyle(style);
    setAiStep('generating');
    setAiProgress(0);

    try {
      const result = await generateAIPortrait(
        capturedPhoto,
        style,
        (pct) => setAiProgress(pct),
      );
      incrementPortraitCount();
      setAiResult(result);
      triggerConfetti();
      setAiStep('reveal');
    } catch {
      // On failure, go back to pick
      setAiStep('pick');
    }
  };

  const triggerConfetti = () => {
    const colors = ['#C4704B', '#D4A853', '#E8865A', '#2B5F8A', '#7A8B5C', '#E8C4B8', '#E84870'];
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * 430,
      y: -10,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
    }));
    setConfettiParticles(particles);
    setTimeout(() => setConfettiParticles([]), 3000);
  };

  const resetAIPortrait = () => {
    setAiStep('capture');
    setCapturedPhoto(null);
    setSelectedStyle(null);
    setAiResult(null);
    setAiProgress(0);
    setShowCompare(false);
    setSaving(false);
    setSaveError(null);
    setSavedTo(null);
  };

  const downloadToDevice = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-portrait-${selectedStyle?.id || 'photo'}-${Date.now()}.jpg`;
    link.click();
  };

  const saveAIPortrait = async (target: SaveTarget) => {
    if (!aiResult) return;

    setSaving(true);
    setSaveError(null);

    try {
      if (target === 'device' || target === 'both') {
        downloadToDevice(aiResult);
      }

      if (target === 'drive' || target === 'both') {
        await savePortraitToDrive(
          aiResult,
          selectedStyle?.id || 'unknown',
          session?.guestId || 0,
          guestName,
        );
      }

      setSavedTo(target);
      setAiStep('saved');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Switch tabs ──
  const switchTab = (newTab: TabMode) => {
    setTabMode(newTab);
    if (newTab === 'ai-portrait') {
      resetAIPortrait();
    }
  };

  // ── Render helpers ──
  const renderPermissionScreen = () => {
    if (permState === 'loading') {
      return (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#1e1c1a', zIndex: 5,
        }}>
          <div style={{
            width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#C4704B', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      );
    }

    if (permState === 'needs-permission') {
      return (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 100%)', zIndex: 5,
          padding: '0 32px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(196,112,75,0.12) 0%, rgba(232,134,90,0.08) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C4704B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#2C2825' }}>Camera Access</p>
          <p style={{ margin: '10px 0 28px', fontSize: 15, color: '#8A8078', lineHeight: 1.5 }}>
            We need your camera to take photos for the wedding album. Your photos stay on your device until you choose to share them.
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
            Allow Camera
          </button>
          <button
            onClick={() => { stopStream(stream); navigate('/app/home'); }}
            style={{
              marginTop: 14, padding: '10px 24px', borderRadius: 20,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#A09890', fontSize: 14, fontWeight: 500,
            }}
          >
            Maybe Later
          </button>
        </div>
      );
    }

    if (permState === 'denied') {
      return (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 100%)', zIndex: 5,
          padding: '0 32px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif",
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
          <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#2C2825' }}>Camera Blocked</p>
          <p style={{ margin: '10px 0 8px', fontSize: 15, color: '#8A8078', lineHeight: 1.5 }}>
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
              2. Find "Camera" and change it to "Allow"
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
            }}
          >
            Go Back
          </button>
        </div>
      );
    }

    return null;
  };

  // ── AI Portrait: Style Picker ──
  const renderStylePicker = () => {
    const popularStyles = AI_PORTRAIT_STYLES.filter(s => s.popular);
    const allStyles = AI_PORTRAIT_STYLES;
    const remaining = getRemainingPortraits();

    return (
      <div style={{
        position: 'absolute', inset: 0, background: '#FEFCF9', zIndex: 30,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button
            onClick={resetAIPortrait}
            style={{
              width: 40, height: 40, borderRadius: '50%', background: 'rgba(44,40,37,0.06)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2C2825" strokeWidth="2.2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: '#2C2825' }}>
              Choose a Style
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#B8AFA6' }}>
              {remaining} portrait{remaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <div style={{ width: 40 }} />
        </div>

        {/* Preview thumbnail */}
        {capturedPhoto && (
          <div style={{ padding: '12px 20px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 16, overflow: 'hidden',
              border: '2px solid rgba(196,112,75,0.2)',
            }}>
              <img src={capturedPhoto} alt="Your photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        )}

        {/* Scrollable styles */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 100px' }} className="scrollbar-hide">
          {/* Most Popular */}
          <p style={{
            margin: '8px 0 10px', fontSize: 13, fontWeight: 600, color: '#8A8078',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>Most Popular</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {popularStyles.map(style => (
              <StyleCard key={style.id} style={style} onSelect={startGeneration} disabled={!canGeneratePortrait()} />
            ))}
          </div>

          {/* All Styles */}
          <p style={{
            margin: '8px 0 10px', fontSize: 13, fontWeight: 600, color: '#8A8078',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>All Styles</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {allStyles.map(style => (
              <StyleCard key={style.id} style={style} onSelect={startGeneration} disabled={!canGeneratePortrait()} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── AI Portrait: Generating ──
  const renderGenerating = () => {
    if (!selectedStyle) return null;

    return (
      <div style={{
        position: 'absolute', inset: 0, background: '#0c0a08', zIndex: 30,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 32px',
      }}>
        {/* Shimmer preview */}
        <div style={{
          width: 200, height: 200, borderRadius: 24, overflow: 'hidden', marginBottom: 32,
          position: 'relative',
        }}>
          {capturedPhoto && (
            <img src={capturedPhoto} alt="" style={{
              width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px) brightness(0.5)',
            }} />
          )}
          {/* Shimmer overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)`,
            animation: 'shimmer 1.5s infinite',
          }} />
        </div>

        <p style={{
          fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600,
          color: 'white', margin: '0 0 4px', textAlign: 'center',
        }}>
          Creating your {selectedStyle.name}
        </p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>
          {selectedStyle.timeEstimate} • AI magic in progress
        </p>

        {/* Progress bar */}
        <div style={{
          width: '100%', maxWidth: 260, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 32,
        }}>
          <div style={{
            width: `${aiProgress}%`, height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, #C4704B 0%, #E8865A 100%)',
            transition: 'width 0.5s ease-out',
          }} />
        </div>

        {/* Fun fact */}
        <div style={{
          background: 'rgba(255,255,255,0.06)', borderRadius: 16,
          padding: '16px 20px', maxWidth: 300, textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 6px', fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Did you know?
          </p>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            {selectedStyle.funFact}
          </p>
        </div>

        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  };

  // ── AI Portrait: Reveal ──
  const renderReveal = () => {
    if (!aiResult || !selectedStyle) return null;

    return (
      <div style={{
        position: 'absolute', inset: 0, background: '#FEFCF9', zIndex: 30,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Confetti */}
        {confettiParticles.map((p, i) => (
          <div key={i} style={{
            position: 'absolute', left: p.x, top: p.y, width: p.size, height: p.size,
            background: p.color, borderRadius: p.size > 6 ? '50%' : 1,
            zIndex: 50, pointerEvents: 'none',
            animation: `confetti-fall 2.5s ease-out forwards`,
            '--vx': `${p.vx * 40}px`,
            '--vy': `${p.vy * 80}px`,
          } as React.CSSProperties} />
        ))}

        {/* Header */}
        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={resetAIPortrait}
            style={{
              width: 40, height: 40, borderRadius: '50%', background: 'rgba(44,40,37,0.06)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2C2825" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          <p style={{
            margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: '#2C2825',
          }}>
            {selectedStyle.emoji} {selectedStyle.name}
          </p>
          <div style={{ width: 40 }} />
        </div>

        {/* Result image */}
        <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '100%', maxWidth: 340, borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            animation: 'revealScale 0.5s ease-out',
          }}>
            <img
              src={showCompare ? (capturedPhoto || '') : aiResult}
              alt={showCompare ? 'Original' : 'AI Portrait'}
              style={{ width: '100%', display: 'block' }}
            />
          </div>

          {/* Compare toggle */}
          <div style={{
            marginTop: 16, display: 'flex', gap: 6,
            background: 'rgba(44,40,37,0.06)', borderRadius: 20, padding: 3,
          }}>
            <button
              onClick={() => setShowCompare(false)}
              style={{
                padding: '8px 18px', borderRadius: 17, border: 'none',
                background: !showCompare ? '#2C2825' : 'transparent',
                color: !showCompare ? 'white' : '#8A8078',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              AI Portrait
            </button>
            <button
              onClick={() => setShowCompare(true)}
              style={{
                padding: '8px 18px', borderRadius: 17, border: 'none',
                background: showCompare ? '#2C2825' : 'transparent',
                color: showCompare ? 'white' : '#8A8078',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Original
            </button>
          </div>
        </div>

        {/* Save options */}
        <div style={{ padding: '0 20px 32px' }}>
          {saveError && (
            <div style={{
              background: 'rgba(212,114,106,0.08)', borderRadius: 12,
              padding: '10px 16px', marginBottom: 12, textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: 13, color: '#D4726A' }}>{saveError}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Save to Device */}
            <button
              onClick={() => saveAIPortrait('device')}
              disabled={saving}
              style={{
                padding: '14px 20px', borderRadius: 16,
                background: 'rgba(44,40,37,0.06)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: saving ? 0.6 : 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #2C2825 0%, #4A4540 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#2C2825' }}>Save to Device</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8A8078' }}>Download to your photos</p>
              </div>
            </button>

            {/* Save to Google Drive */}
            <button
              onClick={() => saveAIPortrait('drive')}
              disabled={saving}
              style={{
                padding: '14px 20px', borderRadius: 16,
                background: 'rgba(44,40,37,0.06)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: saving ? 0.6 : 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #2B5F8A 0%, #4A8BC4 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 19.5h20L12 2z"/>
                  <path d="M2 19.5l10-5.5"/>
                  <path d="M22 19.5l-10-5.5"/>
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#2C2825' }}>Save to Wedding Album</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8A8078' }}>Upload to the shared Google Drive</p>
              </div>
            </button>

            {/* Save to Both */}
            <button
              onClick={() => saveAIPortrait('both')}
              disabled={saving}
              style={{
                padding: '14px 20px', borderRadius: 16,
                background: 'linear-gradient(135deg, #C4704B 0%, #E8865A 100%)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: saving ? 0.6 : 1,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 4px 20px rgba(196,112,75,0.2)',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'white' }}>Save to Both</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Device + Wedding Album</p>
              </div>
            </button>
          </div>

          {/* Try Another link */}
          <button
            onClick={resetAIPortrait}
            disabled={saving}
            style={{
              width: '100%', marginTop: 10, padding: '10px 0',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#A09890', fontSize: 14, fontWeight: 500,
            }}
          >
            Try Another Style
          </button>

          {saving && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8,
            }}>
              <div style={{
                width: 16, height: 16, border: '2px solid rgba(196,112,75,0.2)',
                borderTopColor: '#C4704B', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontSize: 13, color: '#8A8078' }}>Saving...</span>
            </div>
          )}
        </div>

        <style>{`
          @keyframes revealScale {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  };

  // ── AI Portrait: Saved confirmation ──
  const renderSaved = () => {
    if (!selectedStyle) return null;

    const savedMessage = savedTo === 'both'
      ? 'Your portrait has been saved to your device and uploaded to the wedding album.'
      : savedTo === 'drive'
        ? 'Your portrait has been uploaded to the wedding album on Google Drive.'
        : 'Your portrait has been saved to your device.';

    return (
      <div style={{
        position: 'absolute', inset: 0, background: '#FEFCF9', zIndex: 30,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 32px', textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(122,139,92,0.12) 0%, rgba(122,139,92,0.06) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7A8B5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p style={{
          margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: '#2C2825',
        }}>
          Portrait Saved!
        </p>
        <p style={{ margin: '8px 0 32px', fontSize: 15, color: '#8A8078', lineHeight: 1.5 }}>
          {savedMessage}
        </p>
        <button
          onClick={resetAIPortrait}
          style={{
            padding: '14px 40px', borderRadius: 24,
            background: 'linear-gradient(135deg, #C4704B 0%, #E8865A 100%)',
            border: 'none', cursor: 'pointer', color: 'white',
            fontWeight: 600, fontSize: 16, fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 20px rgba(196,112,75,0.3)',
          }}
        >
          Create Another
        </button>
        <button
          onClick={() => { stopStream(stream); navigate('/app/home'); }}
          style={{
            marginTop: 14, padding: '10px 24px', borderRadius: 20,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#A09890', fontSize: 14, fontWeight: 500,
          }}
        >
          Back to Home
        </button>
      </div>
    );
  };

  // ── Determine if we show AI overlay screens ──
  const showAIOverlay = tabMode === 'ai-portrait' && aiStep !== 'capture';

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      maxWidth: 430,
      margin: '0 auto',
      background: '#0c0a08',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Flash overlay */}
      {flash && (
        <div style={{
          position: 'absolute', inset: 0, background: 'white',
          zIndex: 100, opacity: 0.9, pointerEvents: 'none',
        }} />
      )}

      {/* AI Portrait overlay screens */}
      {showAIOverlay && aiStep === 'pick' && renderStylePicker()}
      {showAIOverlay && aiStep === 'generating' && renderGenerating()}
      {showAIOverlay && aiStep === 'reveal' && renderReveal()}
      {showAIOverlay && aiStep === 'saved' && renderSaved()}

      {/* Camera viewfinder area */}
      <div style={{
        flex: 1,
        position: 'relative',
        borderRadius: '0 0 24px 24px',
        overflow: 'hidden',
      }}>
        {/* Hidden video source */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0 }}
        />

        {/* Rendered canvas */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Permission screens */}
        {renderPermissionScreen()}

        {/* Countdown overlay */}
        {countdown !== null && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.2)',
          }}>
            <span style={{
              fontFamily: "'Playfair Display', serif", fontSize: 80,
              fontWeight: 700, color: 'white',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>{countdown}</span>
          </div>
        )}

        {/* Top gradient */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 100,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
          zIndex: 10, pointerEvents: 'none',
        }} />

        {/* Top controls */}
        <div style={{
          position: 'absolute', top: 16, left: 0, right: 0, padding: '0 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20,
        }}>
          {/* Close */}
          <button
            onClick={() => { stopStream(stream); navigate('/app/home'); }}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>

          {/* Guest name pill */}
          <div style={{
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
            borderRadius: 20, padding: '7px 16px', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>
              {guestName}
            </span>
          </div>

          {/* Camera flip */}
          <button
            onClick={toggleCamera}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2-3h2l2 3h5a2 2 0 0 1 2 2v4"/>
              <path d="m18 22-3-3 3-3"/><path d="M22 19h-4"/>
            </svg>
          </button>
        </div>

        {/* Filters / AI Portrait tab toggle */}
        <div style={{
          position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 24,
          padding: 3, backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {([['filters', 'Filters'], ['ai-portrait', 'AI Portrait']] as [TabMode, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              style={{
                padding: '7px 16px', borderRadius: 21, border: 'none',
                background: tabMode === id ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: tabMode === id ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: tabMode === id ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.25s ease', whiteSpace: 'nowrap',
              }}
            >{label}</button>
          ))}
        </div>

        {/* Rule-of-thirds grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3, opacity: 0.04 }}>
          <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: 1, background: 'white' }} />
          <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: 1, background: 'white' }} />
          <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: 1, background: 'white' }} />
          <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: 1, background: 'white' }} />
        </div>
      </div>

      {/* Bottom controls area */}
      <div style={{ background: '#0c0a08', padding: '16px 0 24px', position: 'relative' }}>
        {/* Filter carousel (only in filter mode) */}
        {tabMode === 'filters' && (
          <div style={{
            overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none', padding: '0 20px 16px', display: 'flex', gap: 10,
          }} className="scrollbar-hide">
            {PHOTO_FILTERS.map(filter => {
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 4px', flexShrink: 0,
                    transition: 'transform 0.2s', transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', background: filter.preview,
                    border: isActive ? '3px solid white' : '2px solid rgba(255,255,255,0.15)',
                    boxShadow: isActive
                      ? '0 0 0 3px #C4704B, 0 4px 14px rgba(196,112,75,0.35)'
                      : '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, transparent 60%)',
                    }} />
                  </div>
                  <span style={{
                    fontSize: 11,
                    color: isActive ? 'white' : 'rgba(255,255,255,0.4)',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                  }}>{filter.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* AI Portrait info bar (in AI portrait capture mode) */}
        {tabMode === 'ai-portrait' && aiStep === 'capture' && (
          <div style={{
            padding: '0 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '10px 18px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                Take a photo, then pick an AI style
              </span>
            </div>
          </div>
        )}

        {/* Shutter row */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40,
        }}>
          {/* Gallery shortcut */}
          <button
            onClick={() => { stopStream(stream); navigate('/app/gallery'); }}
            style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'linear-gradient(135deg, #3a3025 0%, #2a2018 100%)',
              border: '2px solid rgba(255,255,255,0.15)', cursor: 'pointer',
            }}
          />

          {/* Shutter button */}
          <button
            onClick={capturePhoto}
            disabled={!cameraReady || countdown !== null}
            style={{
              width: 76, height: 76, borderRadius: '50%', background: 'transparent',
              border: tabMode === 'ai-portrait'
                ? '4px solid #D4A853'
                : '4px solid white',
              cursor: 'pointer', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: tabMode === 'ai-portrait'
                ? '0 0 0 6px rgba(212,168,83,0.15)'
                : '0 0 0 6px rgba(255,255,255,0.08)',
              transition: 'all 0.2s ease',
              opacity: (!cameraReady || countdown !== null) ? 0.4 : 1,
            }}
          >
            <div style={{
              width: 62, height: 62, borderRadius: '50%',
              background: tabMode === 'ai-portrait'
                ? 'linear-gradient(135deg, #D4A853 0%, #E8C878 100%)'
                : 'white',
            }} />
          </button>

          {/* Flash toggle */}
          <button style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── StyleCard sub-component ──────────────────────────────

function StyleCard({
  style,
  onSelect,
  disabled,
}: {
  style: AIPortraitStyle;
  onSelect: (s: AIPortraitStyle) => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onSelect(style)}
      disabled={disabled}
      style={{
        background: style.gradient,
        border: 'none',
        borderRadius: 16,
        padding: '20px 14px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        opacity: disabled ? 0.5 : 1,
        transition: 'transform 0.2s',
        minHeight: 110,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Gradient overlay for text readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)',
      }} />

      {/* Popular badge */}
      {style.popular && (
        <div style={{
          position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.25)',
          borderRadius: 8, padding: '3px 8px', backdropFilter: 'blur(4px)',
        }}>
          <span style={{ fontSize: 10, color: 'white', fontWeight: 600 }}>Popular</span>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 22, display: 'block', marginBottom: 4 }}>{style.emoji}</span>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 600, color: 'white',
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}>
          {style.name}
        </p>
        <p style={{
          margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.75)',
        }}>
          {style.subtitle}
        </p>
      </div>
    </button>
  );
}
