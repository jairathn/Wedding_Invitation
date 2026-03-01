// Schedule Screen — /app/schedule
// Matching design: gradient timeline, emoji event cards, warm backgrounds

import { EVENTS, getCurrentEvent } from '../constants';

const EVENT_STYLES: Record<string, { color: string; bgGradient: string; emoji: string; description: string }> = {
  haldi: {
    color: '#D4A853',
    bgGradient: 'linear-gradient(135deg, rgba(212,168,83,0.08) 0%, rgba(232,196,184,0.05) 100%)',
    emoji: '\uD83C\uDF3C',
    description: 'Traditional turmeric ceremony celebrating the couple',
  },
  sangeet: {
    color: '#E8865A',
    bgGradient: 'linear-gradient(135deg, rgba(232,134,90,0.08) 0%, rgba(196,112,75,0.05) 100%)',
    emoji: '\uD83C\uDFA4',
    description: 'An evening of music, dance & celebration',
  },
  wedding_reception: {
    color: '#2B5F8A',
    bgGradient: 'linear-gradient(135deg, rgba(43,95,138,0.08) 0%, rgba(122,139,92,0.05) 100%)',
    emoji: '\uD83D\uDC8D',
    description: 'The ceremony, cocktails, dinner & after party',
  },
};

export default function ScheduleScreen() {
  const currentEvent = getCurrentEvent();

  return (
    <div style={{
      minHeight: '100%',
      background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 100%)',
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      padding: '0 0 40px',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 24px' }}>
        <h1 style={{
          margin: 0,
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 600,
          color: '#2C2825',
        }}>Wedding Weekend</h1>
        <p style={{
          margin: '4px 0 0',
          fontSize: 14,
          color: '#A09890',
        }}>September 9–11, 2026 · Barcelona</p>
      </div>

      {/* Timeline */}
      <div style={{ padding: '0 24px', position: 'relative' }}>
        {/* Gradient timeline line */}
        <div style={{
          position: 'absolute',
          left: 47,
          top: 20,
          bottom: 20,
          width: 2,
          background: 'linear-gradient(180deg, #D4A853, #E8865A, #2B5F8A)',
          borderRadius: 1,
          opacity: 0.3,
        }} />

        {EVENTS.map((event, i) => {
          const style = EVENT_STYLES[event.slug] || EVENT_STYLES.haldi;
          const isCurrent = currentEvent?.slug === event.slug;
          const eventDate = new Date(event.date + 'T12:00:00');

          return (
            <div key={event.slug} style={{
              display: 'flex',
              gap: 20,
              marginBottom: i < EVENTS.length - 1 ? 24 : 0,
              position: 'relative',
            }}>
              {/* Timeline dot */}
              <div style={{
                width: 48,
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 20,
              }}>
                <div style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: style.color,
                  border: '3px solid #FEFCF9',
                  boxShadow: isCurrent
                    ? `0 0 0 3px ${style.color}40, 0 0 12px ${style.color}30`
                    : `0 0 0 2px ${style.color}33`,
                  zIndex: 1,
                }} />
              </div>

              {/* Event card */}
              <div style={{
                flex: 1,
                background: style.bgGradient,
                border: `1px solid ${style.color}18`,
                borderRadius: 18,
                padding: '20px 22px',
                borderLeft: `3px solid ${style.color}`,
              }}>
                {isCurrent && (
                  <span style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 600,
                    color: style.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    background: `${style.color}12`,
                    padding: '3px 10px',
                    borderRadius: 20,
                    marginBottom: 8,
                  }}>Happening Now</span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{style.emoji}</span>
                  <h3 style={{
                    margin: 0,
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 20,
                    fontWeight: 600,
                    color: '#2C2825',
                  }}>{event.name}</h3>
                </div>

                <p style={{
                  margin: '0 0 12px',
                  fontSize: 14,
                  color: '#8A8078',
                  lineHeight: 1.4,
                }}>{style.description}</p>

                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#A09890' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                    {eventDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 16, fontSize: 13, color: '#A09890' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {event.venueName}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
