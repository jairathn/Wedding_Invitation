import { useState } from 'react';
import { motion } from 'framer-motion';
import { PaperTexture } from './PaperTexture';
import { WaxSeal } from './WaxSeal';

export function Envelope({ onOpen, isOpen, guestName, onNameSubmit }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [nameEntered, setNameEntered] = useState(false);
  const [sealClicked, setSealClicked] = useState(false);

  const handleSealClick = () => {
    setSealClicked(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await fetch('/data/guests.json');
      const guests = await response.json();

      const normalizedInput = name.trim().toLowerCase();
      const found = guests.some(guest => {
        const guestLower = guest.toLowerCase();
        return (
          guestLower === normalizedInput ||
          guestLower.includes(normalizedInput) ||
          normalizedInput.includes(guestLower.split(' ')[0])
        );
      });

      const properName = name.trim().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      if (!found) {
        setError("We couldn't find your name on our list, but please enjoy the invitation!");
      }

      setTimeout(() => {
        onNameSubmit(properName);
        setNameEntered(true);
        // Auto-trigger opening after name is submitted
        setTimeout(() => {
          onOpen();
        }, 800);
      }, found ? 0 : 1500);

    } catch (err) {
      const properName = name.trim().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      onNameSubmit(properName);
      setNameEntered(true);
      // Auto-trigger opening after name is submitted
      setTimeout(() => {
        onOpen();
      }, 800);
    }

    setIsValidating(false);
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
                    placeholder="Enter your name"
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
            <PaperTexture />

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
