// Photo Booth Screen — /app/photo
// Full working camera with categorized filter carousel matching design spec

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestCamera, stopStream, capturePhotoFromFilteredCanvas, checkCameraPermission } from '../lib/camera';
import { getStoredSession } from '../lib/session';
import { PHOTO_FILTERS } from '../lib/filters';
import type { CapturedMedia } from '../types';

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
  const [mode, setMode] = useState<'single' | 'strip'>('single');

  const [activeFilter, setActiveFilter] = useState('none');

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

  // Check permissions on mount, then init camera if already granted
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const perm = await checkCameraPermission();
      if (cancelled) return;
      if (perm === 'granted') {
        // Permission remembered — go straight to camera
        initCamera('user');
      } else if (perm === 'denied') {
        setPermState('denied');
      } else {
        // 'prompt' — show our friendly UI first
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
    const filter = PHOTO_FILTERS.find(f => f.id === activeFilter) || PHOTO_FILTERS[0];
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

      // Delegate entire render to the filter
      filter.render(ctx, canvas, video, mirror);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [activeFilter, facingMode]);

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
        takePhoto();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // White flash
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

        {/* Rendered canvas (with filter applied in real time) */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Permission: loading */}
        {permState === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#1e1c1a', zIndex: 5,
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
            background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 100%)', zIndex: 5,
            padding: '0 32px', textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {/* Camera icon */}
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
            <p style={{
              margin: 0, fontFamily: "'Playfair Display', serif",
              fontSize: 22, fontWeight: 600, color: '#2C2825',
            }}>Camera Access</p>
            <p style={{
              margin: '10px 0 28px', fontSize: 15, color: '#8A8078', lineHeight: 1.5,
            }}>
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
        )}

        {/* Permission: denied — instructions */}
        {permState === 'denied' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 100%)', zIndex: 5,
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
        )}

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

        {/* Mode toggle (Single / Strip of 3) */}
        <div style={{
          position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 24,
          padding: 3, backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {([['single', 'Single'], ['strip', 'Strip of 3']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              style={{
                padding: '7px 16px', borderRadius: 21, border: 'none',
                background: mode === id ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: mode === id ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: mode === id ? 600 : 400,
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
        {/* Filter carousel */}
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
              border: '4px solid white', cursor: 'pointer', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 6px rgba(255,255,255,0.08)',
              transition: 'transform 0.15s ease',
              opacity: (!cameraReady || countdown !== null) ? 0.4 : 1,
            }}
          >
            <div style={{
              width: 62, height: 62, borderRadius: '50%', background: 'white',
            }} />
          </button>

          {/* Flash toggle (placeholder) */}
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
    </div>
  );
}
