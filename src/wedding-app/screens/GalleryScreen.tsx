// My Memories — /app/gallery
// Instagram-style media grid with stats, filter tabs, event badges

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQueued } from '../lib/upload-queue';
import { getStoredSession } from '../lib/session';
import type { QueuedUpload } from '../types';

interface MediaItem {
  id: string;
  type: 'video' | 'photo';
  blobUrl: string;
  event: string;
  timestamp: string;
  filter?: string;
  uploadStatus: 'queued' | 'uploading' | 'failed' | 'complete';
  duration?: number;
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  haldi: { label: 'Haldi', color: '#D4A853' },
  sangeet: { label: 'Sangeet', color: '#E8865A' },
  wedding_reception: { label: 'Wedding', color: '#2B5F8A' },
};

type FilterTab = 'all' | 'photos' | 'videos';

export default function GalleryScreen() {
  const session = getStoredSession();
  const navigate = useNavigate();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const queued = await getAllQueued();
      const guestName = session?.guest ? `${session.guest.firstName} ${session.guest.lastName}` : '';

      const mediaItems: MediaItem[] = queued
        .filter(q => q.metadata.guestName === guestName)
        .map((q: QueuedUpload) => ({
          id: q.id,
          type: q.metadata.mediaType,
          blobUrl: URL.createObjectURL(q.blob),
          event: q.metadata.eventSlug,
          timestamp: q.metadata.capturedAt,
          filter: q.metadata.filterApplied,
          uploadStatus: q.status,
        }));

      setItems(mediaItems);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadItem = (item: MediaItem) => {
    const link = document.createElement('a');
    link.href = item.blobUrl;
    link.download = `${item.type}_${item.event}_${new Date(item.timestamp).getTime()}.${item.type === 'photo' ? 'jpg' : 'webm'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const photoCount = items.filter(i => i.type === 'photo').length;
  const videoCount = items.filter(i => i.type === 'video').length;
  const eventCount = new Set(items.map(i => i.event)).size;

  const filteredItems = items.filter(item => {
    if (activeTab === 'photos') return item.type === 'photo';
    if (activeTab === 'videos') return item.type === 'video';
    return true;
  });

  if (loading) {
    return (
      <div style={{
        minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FEFCF9',
      }}>
        <div style={{
          width: 24, height: 24, border: '2px solid #E8DDD3',
          borderTopColor: '#C4704B', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100%', maxWidth: 430, margin: '0 auto',
      background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 40%, #FFF8F0 100%)',
      fontFamily: "'DM Sans', sans-serif",
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 0' }}>
        <h1 style={{
          margin: 0, fontFamily: "'Playfair Display', serif",
          fontSize: 30, fontWeight: 600, color: '#2C2825',
        }}>My Memories</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#A09890' }}>
          {items.length > 0 ? (
            <>
              <span style={{ fontWeight: 600, color: '#C4704B' }}>{items.length}</span>
              {' '}{items.length === 1 ? 'moment' : 'moments'} captured
            </>
          ) : 'Your wedding moments live here'}
        </p>
      </div>

      {items.length > 0 && (
        <>
          {/* Stats row */}
          <div style={{ padding: '18px 24px 0', display: 'flex', gap: 10 }}>
            {[
              { emoji: '📸', value: photoCount, label: 'Photos' },
              { emoji: '🎬', value: videoCount, label: 'Videos' },
              { emoji: '🎉', value: eventCount, label: 'Events' },
            ].map(stat => (
              <div key={stat.label} style={{
                flex: 1, background: 'white', borderRadius: 14,
                padding: '14px 12px', textAlign: 'center',
                boxShadow: '0 2px 12px rgba(44,40,37,0.06)',
                border: '1px solid rgba(232,221,211,0.5)',
              }}>
                <span style={{ fontSize: 20, display: 'block', marginBottom: 4 }}>{stat.emoji}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#2C2825', display: 'block' }}>
                  {stat.value}
                </span>
                <span style={{ fontSize: 11, color: '#A09890', fontWeight: 500 }}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ padding: '18px 24px 0' }}>
            <div style={{
              display: 'flex', gap: 8,
              background: 'rgba(247,243,237,0.8)', borderRadius: 12, padding: 4,
            }}>
              {(['all', 'photos', 'videos'] as FilterTab[]).map(tab => {
                const isActive = activeTab === tab;
                const label = tab === 'all' ? 'All' : tab === 'photos' ? 'Photos' : 'Videos';
                const count = tab === 'all' ? items.length : tab === 'photos' ? photoCount : videoCount;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, border: 'none', borderRadius: 10, padding: '10px 0',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'all 0.2s',
                      background: isActive
                        ? 'linear-gradient(135deg, #C4704B 0%, #D4896A 100%)'
                        : 'transparent',
                      color: isActive ? 'white' : '#8A8078',
                      boxShadow: isActive ? '0 2px 8px rgba(196,112,75,0.3)' : 'none',
                    }}
                  >
                    {label} {count > 0 && <span style={{ opacity: 0.8 }}>({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          <div style={{ padding: '16px 24px 0' }}>
            {filteredItems.length > 0 ? (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 3, borderRadius: 16, overflow: 'hidden',
              }}>
                {filteredItems.map((item, i) => {
                  const evt = EVENT_LABELS[item.event];
                  const cols = 3;
                  const totalRows = Math.ceil(filteredItems.length / cols);
                  const row = Math.floor(i / cols);
                  const col = i % cols;

                  // Corner rounding on outer edges
                  const tl = row === 0 && col === 0 ? 16 : 0;
                  const tr = row === 0 && col === cols - 1 ? 16 : 0;
                  const bl = row === totalRows - 1 && col === 0 ? 16 : 0;
                  const br = row === totalRows - 1 && col === cols - 1 ? 16 : 0;
                  const borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      style={{
                        position: 'relative', aspectRatio: '1', overflow: 'hidden',
                        background: '#F7F3ED', border: 'none', padding: 0,
                        cursor: 'pointer', borderRadius,
                      }}
                    >
                      {item.type === 'photo' ? (
                        <img
                          src={item.blobUrl}
                          alt=""
                          style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          background: 'linear-gradient(135deg, #2C2825 0%, #4A4540 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {/* Play icon */}
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <svg width="14" height="16" viewBox="0 0 14 16" fill="white">
                              <path d="M0 0L14 8L0 16V0Z" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Event badge */}
                      {evt && (
                        <span style={{
                          position: 'absolute', top: 6, left: 6,
                          fontSize: 9, fontWeight: 700, padding: '3px 7px',
                          borderRadius: 20, color: 'white',
                          backgroundColor: evt.color,
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase',
                        }}>
                          {evt.label}
                        </span>
                      )}

                      {/* Upload status dot */}
                      {item.uploadStatus !== 'complete' && (
                        <span style={{
                          position: 'absolute', bottom: 6, right: 6,
                          width: 8, height: 8, borderRadius: '50%',
                          backgroundColor: item.uploadStatus === 'failed' ? '#D4726A' : '#D4A853',
                          animation: item.uploadStatus === 'uploading' ? 'pulse 1.5s infinite' : 'none',
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ margin: 0, fontSize: 15, color: '#A09890' }}>
                  No {activeTab === 'photos' ? 'photos' : 'videos'} yet
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '60px 24px',
        }}>
          {/* Gradient circle with camera emoji */}
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'linear-gradient(135deg, #F3E8E4 0%, #E8EDF3 50%, #EAF0E6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 8px 32px rgba(196,112,75,0.12)',
          }}>
            <span style={{ fontSize: 40 }}>📷</span>
          </div>

          <h2 style={{
            margin: 0, fontFamily: "'Playfair Display', serif",
            fontSize: 22, fontWeight: 600, color: '#2C2825',
          }}>No memories yet</h2>

          <p style={{
            margin: '10px 0 0', fontSize: 14, color: '#A09890',
            textAlign: 'center', lineHeight: 1.5, maxWidth: 260,
          }}>
            Capture your first photo or video to start building your wedding album
          </p>

          <button
            onClick={() => navigate('/app/photo')}
            style={{
              marginTop: 24, display: 'flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #C4704B 0%, #D4896A 100%)',
              color: 'white', border: 'none', borderRadius: 28,
              padding: '14px 32px', fontSize: 15, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(196,112,75,0.35)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Open Camera
          </button>
        </div>
      )}

      {/* Fullscreen preview modal */}
      {selectedItem && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            paddingTop: 'max(env(safe-area-inset-top), 12px)',
          }}>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              {new Date(selectedItem.timestamp).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => downloadItem(selectedItem)}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Media content */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}>
            {selectedItem.type === 'photo' ? (
              <img
                src={selectedItem.blobUrl}
                alt=""
                style={{
                  maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                  borderRadius: 12,
                }}
              />
            ) : (
              <video
                src={selectedItem.blobUrl}
                controls
                autoPlay
                playsInline
                style={{
                  maxWidth: '100%', maxHeight: '100%', borderRadius: 12,
                }}
              />
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
