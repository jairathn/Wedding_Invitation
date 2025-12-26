import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PaperTexture } from './PaperTexture';
import { WaxSeal } from './WaxSeal';

export function Envelope({ onOpen, isOpen, guestName, onNameSubmit }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [nameEntered, setNameEntered] = useState(false);
  const [sealClicked, setSealClicked] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const videoRef = useRef(null);

  const handleSealClick = () => {
    setSealClicked(true);
  };

  // Auto-play video when envelope opens
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error('Video autoplay failed:', err);
      });
    }
  }, [isOpen]);

  // Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsValidating(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await fetch('/data/guests.json');
      const guests = await response.json();

      // Helper function to clean and normalize names (remove titles, extra spaces)
      const cleanName = (str) => {
        return str
          .replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Miss\.?)\s+/i, '') // Remove titles
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim()
          .toLowerCase();
      };

      const normalizedInput = cleanName(name);
      const inputParts = normalizedInput.split(' ');

      // EXACT MATCH ONLY - no partial matches allowed
      const found = guests.some(guest => {
        const normalizedGuest = cleanName(guest);

        // Only allow exact full name match (case-insensitive)
        return normalizedInput === normalizedGuest;
      });

      if (!found) {
        // Try fuzzy matching (max 2 letter difference)
        const fuzzyMatches = guests
          .map(guest => ({
            original: guest,
            cleaned: cleanName(guest),
            distance: levenshteinDistance(normalizedInput, cleanName(guest))
          }))
          .filter(match => match.distance > 0 && match.distance <= 2)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5) // Top 5 suggestions
          .map(match => match.original);

        if (fuzzyMatches.length > 0) {
          setSuggestions(fuzzyMatches);
          setError("We couldn't find an exact match. Did you mean one of these?");
          setIsValidating(false);
          return;
        }

        setError("If you received this link directly, but your name isn't working, please text us!");
        setIsValidating(false);
        return;
      }

      // Only proceed if found
      const properName = name.trim().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      onNameSubmit(properName);
      setNameEntered(true);
      // Auto-trigger opening after name is submitted
      setTimeout(() => {
        onOpen();
      }, 300);

    } catch (err) {
      // If guest list fails to load, deny access with error message
      setError("Unable to verify guest list. Please text Shriya or Neil for assistance.");
      setIsValidating(false);
    }
  };

  const handleSuggestionClick = (suggestedName) => {
    const properName = suggestedName
      .replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Miss\.?)\s+/i, '') // Remove title for display
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    setSuggestions([]);
    setError('');
    onNameSubmit(properName);
    setNameEntered(true);
    // Auto-trigger opening after name is selected
    setTimeout(() => {
      onOpen();
    }, 300);
  };

  return (
    <motion.div
      className="relative"
      style={{ perspective: '1200px' }}
      animate={{
        y: isOpen ? 150 : 0,
        scale: isOpen ? 0.8 : 1,
      }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Envelope shadow */}
      <motion.div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2"
        style={{
          width: '85%',
          height: '40px',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, transparent 70%)',
          filter: 'blur(12px)',
        }}
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Envelope container */}
      <div
        className="relative w-[460px] max-w-[90vw]"
        style={{
          height: '340px',
          maxHeight: '70vw',
        }}
      >
        {/* Envelope body */}
        <div className="absolute inset-0 overflow-hidden rounded-sm">
          <PaperTexture />

          {/* Enhanced paper gradient - subtle color variation */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse at 20% 30%, rgba(245, 237, 220, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 70%, rgba(235, 220, 195, 0.2) 0%, transparent 50%)
              `,
            }}
          />

          {/* Interior of envelope - visible when flap opens - creates depth */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: 0,
              height: '55%',
              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
              zIndex: 2,
            }}
          >
            {/* Rich gold interior - deeper and more luxurious than flap */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, #B8943F 0%, #A8842F 30%, #98741F 60%, #88640F 100%)',
              }}
            />

            {/* Deep inset shadows for recessed pocket effect */}
            <div
              className="absolute inset-0"
              style={{
                boxShadow: `
                  inset 0 8px 24px rgba(0,0,0,0.4),
                  inset 0 4px 12px rgba(0,0,0,0.3),
                  inset 0 2px 6px rgba(0,0,0,0.2)
                `,
              }}
            />

            {/* Darker edges to emphasize depth */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 20%),
                  linear-gradient(to right, rgba(0,0,0,0.2) 0%, transparent 15%),
                  linear-gradient(to left, rgba(0,0,0,0.2) 0%, transparent 15%)
                `,
              }}
            />

            {/* Subtle shimmer in center - catches light */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.08) 0%, transparent 40%)',
              }}
            />
          </div>

          {/* Worn edges effect */}
          <div
            className="absolute inset-0 pointer-events-none rounded-sm"
            style={{
              boxShadow: `
                inset 0 0 0 1px rgba(139, 119, 101, 0.12),
                inset 1px 1px 2px rgba(139, 119, 101, 0.08),
                inset -1px -1px 2px rgba(139, 119, 101, 0.08)
              `,
            }}
          />

          {/* Content area */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-10"
            style={{ zIndex: sealClicked ? 30 : 1 }}
          >
            {sealClicked && !nameEntered && (
              <motion.div
                className="w-full max-w-[300px] text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <p className="font-serif text-3xl md:text-4xl text-charcoal/80 italic mb-2">
                  Shriya & Neil
                </p>
                <p className="font-sans text-[10px] text-charcoal/50 tracking-[0.25em] uppercase mb-10">
                  Wedding Celebration
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First and Last Name"
                    className="w-full px-4 py-3 bg-white/40 border border-charcoal/15 rounded text-center font-serif text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:border-golden/50 focus:bg-white/60 transition-all text-lg"
                    autoFocus
                    autoComplete="name"
                  />

                  {error && (
                    <motion.p
                      className="text-sm text-charcoal/70 italic"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {error}
                    </motion.p>
                  )}

                  {suggestions.length > 0 && (
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-2 bg-white/50 border border-golden/30 text-charcoal font-serif text-base rounded transition-all duration-200 hover:bg-golden/20 hover:border-golden/50"
                        >
                          {suggestion.replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Miss\.?)\s+/i, '')}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isValidating}
                    className="w-full px-6 py-3 bg-transparent border border-charcoal/25 text-charcoal/70 font-sans text-sm tracking-wide rounded transition-all duration-300 hover:border-charcoal/40 hover:text-charcoal hover:bg-white/30 disabled:opacity-50"
                  >
                    {isValidating ? 'Finding you...' : 'Continue'}
                  </button>
                </form>
              </motion.div>
            )}
          </div>

          {/* Inner shadow for depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.03)',
            }}
          />

          {/* Intro video - positioned on envelope body, below flap */}
          {nameEntered && (
            <video
              ref={videoRef}
              muted
              playsInline
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                top: '55%',
                width: '98%', // Cropped 1% on each side to reveal envelope border shading
                height: 'auto',
                maxHeight: '45%',
                objectFit: 'cover',
                objectPosition: 'top', // Crop from top
                zIndex: 3,
                border: 'none',
                outline: 'none',
              }}
            >
              <source src="/video/intro_video.mp4" type="video/mp4" />
            </video>
          )}
        </div>

        {/* Envelope flap - CLOSED position (folded down over front) */}
        <motion.div
          className="absolute left-0 right-0 origin-top overflow-visible"
          style={{
            top: 0,
            height: '55%',
            transformStyle: 'preserve-3d',
            zIndex: 20,
          }}
          animate={{
            rotateX: isOpen ? -180 : 0,
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Flap front (cream paper - visible when closed) - POINTS DOWN */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
              backfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Original gradient background for flap */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, #FDFCF9 0%, #FAF8F4 50%, #F8F6F1 100%)',
              }}
            />

            {/* Enhanced paper gradient */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                background: `
                  radial-gradient(ellipse at 50% 80%, rgba(245, 237, 220, 0.3) 0%, transparent 60%),
                  radial-gradient(ellipse at 30% 50%, rgba(235, 220, 195, 0.2) 0%, transparent 50%)
                `,
              }}
            />

            {/* Subtle fold line at top */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(139,119,101,0.15), transparent)',
              }}
            />

            {/* Shadow along diagonal edges using drop-shadow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                filter: `
                  drop-shadow(-4px 0px 8px rgba(0,0,0,0.6))
                  drop-shadow(4px 0px 8px rgba(0,0,0,0.6))
                  drop-shadow(-2px 0px 4px rgba(0,0,0,0.5))
                  drop-shadow(2px 0px 4px rgba(0,0,0,0.5))
                  drop-shadow(0px 4px 12px rgba(0,0,0,0.4))
                `,
                background: 'rgba(0,0,0,0.02)',
              }}
            />

            {/* STRONG visible border on all flap edges */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                boxShadow: 'inset 0 0 0 2px rgba(80, 60, 40, 0.5)',
              }}
            />
          </div>

          {/* Flap back (gold liner - visible when open) - OPPOSITE polygon so it points DOWN when rotated */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
              backfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              background: 'linear-gradient(180deg, #D4B870 0%, #C9A855 40%, #B8943F 100%)',
            }}
          >
            {/* Personalized greeting etched into gold liner */}
            {nameEntered && guestName && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  top: '20%',
                  maxWidth: '80%',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? [0, 0, 1, 1, 0] : 0 }}
                transition={{
                  duration: 6.3,
                  times: [0, 0.635, 0.667, 0.873, 1],
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <p
                  className="font-serif italic whitespace-nowrap text-center"
                  style={{
                    fontSize: (() => {
                      const nameLength = guestName.split(' ')[0].length;
                      const totalLength = 5 + nameLength; // "Dear " + name + ","
                      // Reduce font size for longer names
                      if (totalLength > 15) return 'clamp(24px, 4vw, 36px)';
                      if (totalLength > 12) return 'clamp(28px, 4.5vw, 40px)';
                      return 'clamp(32px, 5vw, 48px)';
                    })(),
                    color: '#E5C888', // Lighter gold - embossed surface
                    textShadow: `
                      -1px -1px 1px rgba(255, 255, 255, 0.8),
                      1px 1px 2px rgba(0, 0, 0, 0.4),
                      2px 2px 4px rgba(0, 0, 0, 0.3)
                    `, // Embossed/raised effect
                    letterSpacing: '0.05em',
                    fontWeight: 500,
                  }}
                >
                  Dear {guestName.split(' ')[0]},
                </p>
              </motion.div>
            )}

            {/* Gold shimmer */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%)',
              }}
            />

            {/* Enhanced depth shadows */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
                boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        </motion.div>

        {/* Wax Seal - OUTSIDE flap container to ensure clickability */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: '54%', // Position at the tip of the flap (55% flap height - 1% for visual centering)
            zIndex: sealClicked || isOpen ? -1 : 200, // Move behind when seal is clicked or envelope opens
            pointerEvents: sealClicked || isOpen ? 'none' : 'auto', // Disable pointer events when seal is clicked or envelope opens
          }}
          animate={{
            rotateX: isOpen ? -180 : 0,
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <WaxSeal onClick={handleSealClick} isVisible={!sealClicked && !isOpen} />
        </motion.div>
      </div>
    </motion.div>
  );
}
