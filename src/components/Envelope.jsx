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

            {/* Enhanced edge shadow for 3D effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                boxShadow: `
                  inset 0 3px 12px rgba(0,0,0,0.08),
                  inset 0 -2px 8px rgba(0,0,0,0.05),
                  0 4px 16px rgba(0,0,0,0.12)
                `,
              }}
            />

            {/* Wax Seal - at the TIP of the flap where it seals */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: '85%',
                transform: 'translateX(-50%) translateZ(10px)',
                transformStyle: 'preserve-3d',
                zIndex: 40,
              }}
            >
              <WaxSeal onClick={handleSealClick} isVisible={!sealClicked && !isOpen} />
            </div>
          </div>

          {/* Flap back (gold liner - visible when open) */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
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
                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
