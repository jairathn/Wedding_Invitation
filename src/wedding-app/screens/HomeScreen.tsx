// Home Screen — /app/home
// Faithful implementation of design spec: warm gradient cards, ambient glows,
// quick stats bar, DM Sans body, Playfair headlines

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Monogram from '../components/Monogram';
import { getStoredSession } from '../lib/session';
import { getCurrentEvent, getNextEvent, EVENTS } from '../constants';
import { getAllGuests } from '../lib/guest-search';

// ── Card data matching the design spec exactly ──
const CARDS = [
  {
    id: 'video',
    title: 'Video Message',
    subtitle: 'Send a wish to the couple',
    path: '/app/video',
    gradient: 'linear-gradient(135deg, #E8865A 0%, #C4704B 50%, #B85D3A 100%)',
    shadowColor: 'rgba(196, 112, 75, 0.35)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    id: 'photo',
    title: 'Photo Booth',
    subtitle: 'Filters & AI portraits',
    path: '/app/photo',
    gradient: 'linear-gradient(135deg, #D4A853 0%, #C4914A 50%, #B87D40 100%)',
    shadowColor: 'rgba(212, 168, 83, 0.35)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    ),
  },
  {
    id: 'schedule',
    title: 'Schedule',
    subtitle: 'Events & venues',
    path: '/app/schedule',
    gradient: 'linear-gradient(135deg, #6B8EC4 0%, #2B5F8A 100%)',
    shadowColor: 'rgba(43, 95, 138, 0.3)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    id: 'guests',
    title: 'Guests',
    subtitle: 'Find your friends',
    path: '/app/directory',
    gradient: 'linear-gradient(135deg, #9DB88C 0%, #7A8B5C 100%)',
    shadowColor: 'rgba(122, 139, 92, 0.3)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'gallery',
    title: 'My Gallery',
    subtitle: 'Your memories',
    path: '/app/gallery',
    gradient: 'linear-gradient(135deg, #C48DA0 0%, #A66B7E 100%)',
    shadowColor: 'rgba(166, 107, 126, 0.3)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
  },
];

const EVENT_BANNER_STYLES: Record<string, { gradient: string; borderColor: string; labelColor: string }> = {
  haldi: {
    gradient: 'linear-gradient(135deg, rgba(254,243,226,0.9) 0%, rgba(248,228,206,0.7) 100%)',
    borderColor: 'rgba(212,168,83,0.2)',
    labelColor: '#C4914A',
  },
  sangeet: {
    gradient: 'linear-gradient(135deg, rgba(254,240,232,0.9) 0%, rgba(248,226,214,0.7) 100%)',
    borderColor: 'rgba(232,134,90,0.2)',
    labelColor: '#D07040',
  },
  wedding_reception: {
    gradient: 'linear-gradient(135deg, rgba(230,240,250,0.9) 0%, rgba(218,232,248,0.7) 100%)',
    borderColor: 'rgba(43,95,138,0.2)',
    labelColor: '#2B5F8A',
  },
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const currentEvent = getCurrentEvent();
  const nextEvent = getNextEvent();
  const activeEvent = currentEvent || nextEvent;
  const firstName = session?.guest?.firstName || 'Guest';

  const [loaded, setLoaded] = useState(false);
  const [tappedCard, setTappedCard] = useState<string | null>(null);

  const guestCount = useMemo(() => getAllGuests().length, []);

  // Days until first event
  const daysToGo = useMemo(() => {
    const next = getNextEvent();
    if (!next) return 0;
    const eventDate = new Date(next.date + 'T12:00:00');
    const today = new Date();
    const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCardTap = (card: typeof CARDS[0]) => {
    setTappedCard(card.id);
    setTimeout(() => {
      setTappedCard(null);
      navigate(card.path);
    }, 200);
  };

  const bannerStyle = activeEvent
    ? EVENT_BANNER_STYLES[activeEvent.slug] || EVENT_BANNER_STYLES.haldi
    : null;

  const bannerIconGradient = activeEvent?.slug === 'sangeet'
    ? 'linear-gradient(135deg, #E8865A 0%, #D07040 100%)'
    : activeEvent?.slug === 'wedding_reception'
    ? 'linear-gradient(135deg, #6B8EC4 0%, #2B5F8A 100%)'
    : 'linear-gradient(135deg, #D4A853 0%, #C4914A 100%)';

  return (
    <div style={{
      minHeight: '100%',
      background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 30%, #FFF8F0 100%)',
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Warm ambient glows */}
      <div style={{
        position: 'fixed',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,134,90,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        bottom: 60,
        left: -80,
        width: 250,
        height: 250,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, paddingBottom: 24 }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          <div>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: '#A09890',
              fontWeight: 400,
              letterSpacing: '0.02em',
            }}>Welcome back,</p>
            <h1 style={{
              margin: '2px 0 0',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 34,
              fontWeight: 600,
              color: '#2C2825',
              letterSpacing: '-0.01em',
            }}>{firstName}</h1>
          </div>
          <Monogram size={44} />
        </div>

        {/* Event Banner */}
        {activeEvent && bannerStyle && (
          <div
            onClick={() => navigate('/app/schedule')}
            style={{
              margin: '20px 24px 0',
              padding: '16px 20px',
              borderRadius: 16,
              background: bannerStyle.gradient,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${bannerStyle.borderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: bannerIconGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(212,168,83,0.3)',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 18 }}>&#10024;</span>
              </div>
              <div>
                <p style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 600,
                  color: bannerStyle.labelColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>{currentEvent ? 'Happening Now' : 'Up Next'}</p>
                <p style={{
                  margin: '2px 0 0',
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#2C2825',
                }}>{activeEvent.name}</p>
                <p style={{
                  margin: '2px 0 0',
                  fontSize: 13,
                  color: '#8A8078',
                }}>
                  {new Date(activeEvent.date + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })} &middot; {activeEvent.venueName}
                </p>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={bannerStyle.labelColor} strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        )}

        {/* Hero Cards — Video & Photo (top row, 2 columns) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
          padding: '20px 24px 0',
        }}>
          {CARDS.slice(0, 2).map((card, i) => (
            <div
              key={card.id}
              onClick={() => handleCardTap(card)}
              style={{
                borderRadius: 22,
                padding: '28px 20px 24px',
                background: card.gradient,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                cursor: 'pointer',
                boxShadow: `0 8px 32px ${card.shadowColor}, 0 2px 8px rgba(0,0,0,0.06)`,
                transform: tappedCard === card.id
                  ? 'scale(0.96)'
                  : loaded ? 'translateY(0)' : 'translateY(20px)',
                opacity: loaded ? 1 : 0,
                transition: tappedCard === card.id
                  ? 'transform 0.15s ease'
                  : `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${0.2 + i * 0.08}s`,
                minHeight: 155,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative circles */}
              <div style={{
                position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
              }} />
              <div style={{
                position: 'absolute', bottom: -30, left: -15, width: 60, height: 60,
                borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
              }} />

              {/* Icon circle */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {card.icon}
              </div>
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <p style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'white',
                  letterSpacing: '-0.01em',
                }}>{card.title}</p>
                <p style={{
                  margin: '4px 0 0',
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.75)',
                  fontWeight: 400,
                }}>{card.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Cards — Schedule, Guests, Gallery (row of 3) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          padding: '14px 24px 0',
        }}>
          {CARDS.slice(2).map((card, i) => (
            <div
              key={card.id}
              onClick={() => handleCardTap(card)}
              style={{
                borderRadius: 18,
                padding: '22px 12px 18px',
                background: card.gradient,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: 'pointer',
                boxShadow: `0 6px 24px ${card.shadowColor}, 0 2px 6px rgba(0,0,0,0.05)`,
                transform: tappedCard === card.id
                  ? 'scale(0.96)'
                  : loaded ? 'translateY(0)' : 'translateY(20px)',
                opacity: loaded ? 1 : 0,
                transition: tappedCard === card.id
                  ? 'transform 0.15s ease'
                  : `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${0.35 + i * 0.08}s`,
                minHeight: 115,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative circle */}
              <div style={{
                position: 'absolute', top: -15, right: -15, width: 50, height: 50,
                borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
              }} />

              <div style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {card.icon}
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'white',
                }}>{card.title}</p>
                <p style={{
                  margin: '3px 0 0',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.7)',
                }}>{card.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div style={{
          margin: '24px 24px 0',
          padding: '18px 20px',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(232,221,211,0.5)',
          display: 'flex',
          justifyContent: 'space-around',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.5s',
        }}>
          {[
            { number: String(EVENTS.length), label: 'Events', emoji: '\uD83C\uDF89' },
            { number: String(guestCount), label: 'Guests', emoji: '\uD83D\uDC9B' },
            { number: String(daysToGo), label: 'Days to go', emoji: '\u2728' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, marginBottom: 4 }}>{stat.emoji}</p>
              <p style={{
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                fontSize: 22,
                fontWeight: 600,
                color: '#2C2825',
              }}>{stat.number}</p>
              <p style={{
                margin: '2px 0 0',
                fontSize: 12,
                color: '#A09890',
              }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Save reminder tip */}
        <div style={{
          margin: '18px 24px 0',
          padding: '14px 18px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(122,139,92,0.08) 0%, rgba(122,139,92,0.04) 100%)',
          border: '1px solid rgba(122,139,92,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: loaded ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.6s',
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>&#x1F4A1;</span>
          <p style={{
            margin: 0,
            fontSize: 13,
            color: '#5C6B48',
            lineHeight: 1.4,
          }}>
            <strong>Tip:</strong> Always "Save to Both" so your memories are backed up to the wedding album and your phone!
          </p>
        </div>
      </div>
    </div>
  );
}
