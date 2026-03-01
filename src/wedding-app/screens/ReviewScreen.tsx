// Review & Save Screen — /app/review
// Matching design: warm light bg, gradient CTA, "Recommended" badge, confetti

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredSession } from '../lib/session';
import { addToQueue, processQueue } from '../lib/upload-queue';
import { generateFilename } from '../lib/camera';
import { getCurrentEvent, FILTER_CATEGORIES } from '../constants';
import type { CapturedMedia } from '../types';

interface ReviewMediaItem {
  blobUrl: string;
  dataUrl?: string;
  type: 'video' | 'photo';
  duration?: number;
  filterApplied?: string;
  promptAnswered?: string;
}

export default function ReviewScreen() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const [mediaItems, setMediaItems] = useState<ReviewMediaItem[]>([]);
  const [capturedBlobs, setCapturedBlobs] = useState<CapturedMedia[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const currentEvent = getCurrentEvent();
  const eventSlug = currentEvent?.slug || 'wedding_reception';
  const guestName = session?.guest ? `${session.guest.firstName} ${session.guest.lastName}` : 'Guest';

  // Get filter display name
  const allFilters = FILTER_CATEGORIES.flatMap(c => c.filters);

  useEffect(() => {
    const stored = sessionStorage.getItem('reviewMedia');
    if (stored) {
      const items: ReviewMediaItem[] = JSON.parse(stored);
      setMediaItems(items);
    }
    const blobs = (window as unknown as Record<string, unknown>).__capturedMedia as CapturedMedia[] | undefined;
    if (blobs) {
      setCapturedBlobs(blobs);
    }
    if (!stored) {
      navigate('/app/home');
    }
  }, [navigate]);

  const currentMedia = mediaItems[currentIndex];
  const filterName = currentMedia?.filterApplied
    ? allFilters.find(f => f.id === currentMedia.filterApplied)?.name
    : null;

  // ── Save to device (Photos app on phone, Files on desktop) ──
  const saveToDevice = async () => {
    if (!capturedBlobs[currentIndex]) return;
    const blob = capturedBlobs[currentIndex].blob;
    const filename = generateFilename(currentMedia.type, eventSlug, guestName);

    // Use Web Share API on mobile only (saves to Camera Roll via share sheet).
    // On desktop, skip straight to download — the share picker is confusing there.
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], filename, {
          type: currentMedia.type === 'photo' ? 'image/jpeg' : 'video/webm',
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Neil & Shriya's Wedding",
          });
          return;
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        // Fallback to download
      }
    }

    // Fallback: trigger download (saves to Downloads/Files on desktop)
    const url = currentMedia.dataUrl || currentMedia.blobUrl || URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Queue all captured media for upload to Google Drive ──
  const queueForAlbum = async () => {
    if (!capturedBlobs.length) return;
    for (const media of capturedBlobs) {
      const filename = generateFilename(media.type, eventSlug, guestName);
      await addToQueue({
        id: crypto.randomUUID(),
        blob: media.blob,
        metadata: {
          guestId: session?.guestId || 0,
          guestName,
          eventSlug: eventSlug as 'haldi' | 'sangeet' | 'wedding_reception',
          mediaType: media.type,
          filename,
          filterApplied: media.filterApplied,
          promptAnswered: media.promptAnswered,
          capturedAt: new Date().toISOString(),
        },
        status: 'queued',
        retryCount: 0,
      });
    }
    // Start uploading immediately (don't wait for 30s interval)
    processQueue();
  };

  // ── Save to wedding album (upload queue → Google Drive) ──
  const saveToAlbum = async () => {
    setSaving(true);
    try {
      await queueForAlbum();
      triggerSuccess();
    } finally {
      setSaving(false);
    }
  };

  // ── Save to both (device + album) ──
  const saveToBoth = async () => {
    setSaving(true);
    try {
      // Run independently so a device-save failure doesn't block the album upload
      await Promise.allSettled([saveToDevice(), queueForAlbum()]);
      triggerSuccess();
    } finally {
      setSaving(false);
    }
  };

  const triggerSuccess = () => {
    setSaved(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('reviewMedia');
      delete (window as unknown as Record<string, unknown>).__capturedMedia;
    };
  }, []);

  if (!currentMedia) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 100%)',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <p style={{ color: '#A09890' }}>No media to review</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh', maxWidth: 430, margin: '0 auto',
      background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 100%)',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Confetti */}
      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 30 }).map((_, i) => {
            const colors = ['#C4704B', '#D4A853', '#E8C4B8', '#7A8B5C', '#E8865A', '#2B5F8A'];
            const color = colors[i % colors.length];
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const size = 6 + Math.random() * 8;
            const rotation = Math.random() * 360;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute', left: `${left}%`, top: -20,
                  width: size, height: size * (0.6 + Math.random() * 0.8),
                  background: color, borderRadius: Math.random() > 0.5 ? '50%' : 2,
                  transform: `rotate(${rotation}deg)`,
                  animation: `confettiFall ${1.5 + Math.random()}s ease-out ${delay}s forwards`,
                  opacity: 0,
                }}
              />
            );
          })}
          <style>{`
            @keyframes confettiFall {
              0% { opacity: 1; transform: translateY(0) rotate(0deg); }
              100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
            }
          `}</style>
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(196,112,75,0.08)', border: 'none', borderRadius: '50%',
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4704B" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <p style={{
          margin: 0, fontFamily: "'Playfair Display', serif",
          fontSize: 18, fontWeight: 600, color: '#2C2825',
        }}>Your Photo</p>
        <div style={{ width: 40 }} />
      </div>

      {/* Photo preview */}
      <div style={{
        margin: '0 20px', borderRadius: 20, overflow: 'hidden',
        aspectRatio: '3 / 4', position: 'relative',
        boxShadow: '0 8px 40px rgba(44,40,37,0.12)',
        background: '#1e1c1a',
      }}>
        {currentMedia.type === 'photo' ? (
          <img
            src={currentMedia.dataUrl || currentMedia.blobUrl}
            alt="Captured photo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <video
            ref={videoPreviewRef}
            src={currentMedia.blobUrl}
            controls
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* Watermark */}
        <div style={{ position: 'absolute', bottom: 16, left: 20 }}>
          <p style={{
            margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 13,
            color: 'rgba(255,255,255,0.2)', fontStyle: 'italic',
          }}>#JayWalkingToJairath</p>
        </div>

        {/* Filter badge */}
        {filterName && filterName !== 'No Filter' && (
          <div style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
            padding: '5px 12px', borderRadius: 12,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{filterName}</span>
          </div>
        )}
      </div>

      {/* Prompt text */}
      {currentMedia.promptAnswered && (
        <p style={{
          textAlign: 'center', fontSize: 13, color: '#8A8078', fontStyle: 'italic',
          padding: '12px 32px 0', margin: 0,
        }}>"{currentMedia.promptAnswered}"</p>
      )}

      {/* Pagination dots */}
      {mediaItems.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '12px 0' }}>
          {mediaItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: i === currentIndex ? 20 : 6, height: 6, borderRadius: 3,
                background: i === currentIndex ? '#C4704B' : '#E8DDD3',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
      )}

      {/* Save options */}
      <div style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {!saved ? (
          <>
            {/* Primary CTA: Save to Both */}
            <div style={{ position: 'relative', marginTop: 8 }}>
              {/* Recommended badge — outside button to avoid clipping */}
              <div style={{
                position: 'absolute', top: -8, right: 16, zIndex: 1,
                background: '#D4A853', padding: '2px 10px 4px',
                borderRadius: '0 0 8px 8px', fontSize: 10, fontWeight: 700,
                color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>Recommended</div>

              <button
                onClick={saveToBoth}
                disabled={saving}
                style={{
                  width: '100%', padding: '18px 16px 16px', borderRadius: 16,
                  background: 'linear-gradient(135deg, #C4704B 0%, #E8865A 100%)',
                  border: 'none', cursor: saving ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 4px 20px rgba(196,112,75,0.3)',
                  opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s',
                }}
              >
                <span style={{ fontSize: 18 }}>&#11088;</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: 16 }}>
                    {saving ? 'Saving...' : 'Save to Both'}
                  </p>
                  <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                    Wedding album + your phone
                  </p>
                </div>
              </button>
            </div>

            {/* Secondary: side-by-side */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={saveToAlbum}
                disabled={saving}
                style={{
                  flex: 1, padding: 14, borderRadius: 14, background: 'white',
                  border: '1.5px solid #E8DDD3', cursor: 'pointer', textAlign: 'center',
                }}
              >
                <p style={{ margin: 0, color: '#2C2825', fontWeight: 500, fontSize: 14 }}>Wedding Album</p>
                <p style={{ margin: '2px 0 0', color: '#A09890', fontSize: 11 }}>Google Drive</p>
              </button>
              <button
                onClick={saveToDevice}
                style={{
                  flex: 1, padding: 14, borderRadius: 14, background: 'white',
                  border: '1.5px solid #E8DDD3', cursor: 'pointer', textAlign: 'center',
                }}
              >
                <p style={{ margin: 0, color: '#2C2825', fontWeight: 500, fontSize: 14 }}>My Phone</p>
                <p style={{ margin: '2px 0 0', color: '#A09890', fontSize: 11 }}>Download</p>
              </button>
            </div>
          </>
        ) : (
          /* Saved state */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(122,139,92,0.12) 0%, rgba(122,139,92,0.06) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7A8B5C" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{
              margin: 0, fontFamily: "'Playfair Display', serif",
              fontSize: 22, fontWeight: 600, color: '#2C2825',
            }}>Saved!</p>
            <p style={{
              margin: '6px 0 0', fontSize: 14, color: '#A09890',
            }}>Your memory is safe in the wedding album and on your phone</p>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{
        padding: '16px 20px 32px', display: 'flex', gap: 12, justifyContent: 'center',
      }}>
        <button
          onClick={() => navigate('/app/photo')}
          style={{
            padding: '12px 28px', borderRadius: 24,
            background: saved ? 'linear-gradient(135deg, #C4704B 0%, #E8865A 100%)' : 'rgba(196,112,75,0.08)',
            border: 'none', cursor: 'pointer',
            color: saved ? 'white' : '#C4704B',
            fontWeight: 600, fontSize: 15,
            boxShadow: saved ? '0 4px 16px rgba(196,112,75,0.3)' : 'none',
          }}
        >
          {saved ? 'Take Another \uD83D\uDCF8' : 'Retake'}
        </button>
        {saved && (
          <button
            onClick={() => navigate('/app/home')}
            style={{
              padding: '12px 28px', borderRadius: 24, background: 'white',
              border: '1.5px solid #E8DDD3', cursor: 'pointer',
              color: '#2C2825', fontWeight: 500, fontSize: 15,
            }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
