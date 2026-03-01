// Photo Booth Screen — /app/photo
// Full working camera with categorized filter carousel matching design spec

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestCamera, stopStream, capturePhotoFromFilteredCanvas } from '../lib/camera';
import { getStoredSession } from '../lib/session';
import { FILTER_CATEGORIES } from '../constants';
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
  const [cameraError, setCameraError] = useState(false);
  const [flash, setFlash] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [mode, setMode] = useState<'single' | 'strip'>('single');

  const [activeFilter, setActiveFilter] = useState('none');
  const activeFilterData = FILTER_CATEGORIES
    .flatMap(c => c.filters)
    .find(f => f.id === activeFilter);

  const guestName = session?.guest
    ? `${session.guest.firstName} ${session.guest.lastName}`
    : 'Guest';

  // ── Camera init ──
  const initCamera = useCallback(async (facing: 'user' | 'environment') => {
    try {
      if (stream) stopStream(stream);
      setCameraError(false);
      const newStream = await requestCamera(facing, false);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setCameraReady(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(true);
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

  // ── Live canvas render with filter ──
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
      ctx.filter = activeFilterData?.cssFilter || 'none';

      // Mirror for front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = 'none';

      // Text overlay (hashtag watermark from filter)
      if (activeFilterData?.textOverlay) {
        const { text, position, color } = activeFilterData.textOverlay;
        ctx.save();
        ctx.font = `${Math.floor(canvas.height * 0.025)}px 'Playfair Display', Georgia, serif`;
        ctx.fillStyle = color;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        const x = canvas.width * 0.04;
        const y = position === 'bottom' ? canvas.height * 0.96 : canvas.height * 0.05;
        ctx.fillText(text, x, y);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [activeFilterData, facingMode]);

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

        {/* Camera error state */}
        {cameraError && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: '#1e1c1a', zIndex: 5,
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 16, fontSize: 14, textAlign: 'center', padding: '0 32px' }}>
              Camera access needed. Please allow camera permissions and reload.
            </p>
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

        {/* Active filter name badge */}
        {activeFilter !== 'none' && activeFilterData && (
          <div style={{
            position: 'absolute', top: 118, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)',
              padding: '5px 14px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500 }}>
                {activeFilterData.name}
              </span>
            </div>
          </div>
        )}

        {/* Hashtag watermark */}
        <div style={{ position: 'absolute', bottom: 16, left: 20, zIndex: 5 }}>
          <p style={{
            margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 14,
            color: 'rgba(255,255,255,0.15)', fontStyle: 'italic', letterSpacing: '0.02em',
          }}>#JayWalkingToJairath</p>
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
        {/* Filter carousel with category labels */}
        <div style={{
          overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none', padding: '0 20px 16px', display: 'flex', gap: 4,
        }} className="scrollbar-hide">
          {FILTER_CATEGORIES.map((category, ci) => (
            <div key={ci} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
              {/* Category divider + label */}
              {ci > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', padding: '0 6px 0 10px', alignSelf: 'center',
                }}>
                  <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.08)', marginRight: 10 }} />
                  <span style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap',
                  }}>{category.label}</span>
                </div>
              )}

              {/* Filter swatches */}
              {category.filters.map(filter => {
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '4px 6px', flexShrink: 0,
                      transition: 'transform 0.2s', transform: isActive ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%', background: filter.preview,
                      border: isActive ? '2.5px solid white' : '2px solid rgba(255,255,255,0.15)',
                      boxShadow: isActive
                        ? '0 0 0 2.5px #C4704B, 0 4px 12px rgba(196,112,75,0.3)'
                        : '0 2px 8px rgba(0,0,0,0.3)',
                      transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2) 0%, transparent 60%)',
                      }} />
                    </div>
                    <span style={{
                      fontSize: 10,
                      color: isActive ? '#C4704B' : 'rgba(255,255,255,0.4)',
                      fontWeight: isActive ? 600 : 400,
                      transition: 'all 0.2s', whiteSpace: 'nowrap',
                      maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{filter.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
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
