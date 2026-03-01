// Guest Directory — /app/directory
// iOS Contacts-style list with search, colored avatars, alphabet sidebar

import { useState, useMemo, useRef } from 'react';
import { getAllGuests, searchGuests, type GuestSuggestion } from '../lib/guest-search';

const AVATAR_COLORS = [
  { bg: '#F3E8E4', text: '#C4704B' },
  { bg: '#E8EDF3', text: '#2B5F8A' },
  { bg: '#EAF0E6', text: '#5C7A4A' },
  { bg: '#F5F0E4', text: '#B8923E' },
  { bg: '#F0E6EE', text: '#8A4A78' },
  { bg: '#E8F0F0', text: '#4A7A7A' },
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ background: 'rgba(196,112,75,0.15)', borderRadius: 3, padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function DirectoryScreen() {
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const allGuests = useMemo(() => getAllGuests(), []);

  const displayedGuests = useMemo(() => {
    if (!query.trim()) return allGuests;
    return searchGuests(query);
  }, [query, allGuests]);

  const grouped = useMemo(() => {
    const groups: Record<string, GuestSuggestion[]> = {};
    const sorted = [...displayedGuests].sort((a, b) =>
      a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
    );
    for (const guest of sorted) {
      const letter = guest.lastName.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(guest);
    }
    return groups;
  }, [displayedGuests]);

  const letters = Object.keys(grouped).sort();
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`guest-section-${letter}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{
      minHeight: '100%', maxWidth: 430, margin: '0 auto',
      background: 'linear-gradient(180deg, #FEF9F2 0%, #FEFCF9 40%, #FFF8F0 100%)',
      fontFamily: "'DM Sans', sans-serif", position: 'relative',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 0' }}>
        <h1 style={{
          margin: 0, fontFamily: "'Playfair Display', serif",
          fontSize: 30, fontWeight: 600, color: '#2C2825',
        }}>Guest List</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#A09890' }}>
          <span style={{ fontWeight: 600, color: '#C4704B' }}>{allGuests.length}</span> friends & family celebrating together
        </p>
      </div>

      {/* Search card */}
      <div style={{ padding: '18px 24px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'white', borderRadius: 16, padding: '14px 18px',
          boxShadow: '0 2px 12px rgba(44,40,37,0.06)',
          border: '1px solid rgba(232,221,211,0.5)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B8AFA6" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Search guests..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: 16, color: '#2C2825', background: 'transparent',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              background: 'rgba(160,152,144,0.15)', border: 'none',
              borderRadius: '50%', width: 24, height: 24, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A8078" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', position: 'relative' }}>
        {/* Guest list */}
        <div ref={listRef} style={{ flex: 1, padding: '16px 24px 0 24px' }}>
          {letters.map((letter) => (
            <div key={letter} id={`guest-section-${letter}`} style={{ marginBottom: 8 }}>
              {/* Sticky letter header */}
              <div style={{
                padding: '8px 0 6px',
                position: 'sticky', top: 0, zIndex: 5,
                background: 'linear-gradient(180deg, #FEF9F2 90%, transparent 100%)',
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: '#C4704B',
                  letterSpacing: '0.06em',
                }}>{letter}</span>
              </div>

              {grouped[letter].map((guest, ni) => {
                const colors = getAvatarColor(guest.fullName);
                const initials = `${guest.firstName.charAt(0)}${guest.lastName.charAt(0)}`;
                return (
                  <div key={`${guest.fullName}-${ni}`} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 0',
                    borderBottom: ni < grouped[letter].length - 1
                      ? '1px solid rgba(232,221,211,0.4)' : 'none',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: colors.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontSize: 15, fontWeight: 600, color: colors.text,
                        letterSpacing: '0.02em',
                      }}>{initials}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#2C2825' }}>
                        {query ? (
                          <HighlightMatch text={guest.fullName} query={query} />
                        ) : (
                          <>{guest.firstName} <span style={{ color: '#8A8078' }}>{guest.lastName}</span></>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {displayedGuests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🔍</span>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color: '#2C2825' }}>No guests found</p>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#A09890' }}>Try a different name</p>
            </div>
          )}
        </div>

        {/* Alphabet sidebar */}
        <div style={{
          position: 'sticky', top: 0, right: 0, height: '100vh',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '0 8px 0 4px', gap: 1,
        }}>
          {allLetters.map((l) => {
            const hasGuests = letters.includes(l);
            return (
              <button
                key={l}
                onClick={() => hasGuests && scrollToLetter(l)}
                style={{
                  width: 20, height: 18, borderRadius: 4,
                  background: 'none', border: 'none',
                  cursor: hasGuests ? 'pointer' : 'default',
                  color: hasGuests ? '#C4704B' : '#D4CCC4',
                  fontSize: 10, fontWeight: 700, padding: 0,
                  transition: 'all 0.15s',
                  opacity: hasGuests ? 1 : 0.4,
                }}
              >{l}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
