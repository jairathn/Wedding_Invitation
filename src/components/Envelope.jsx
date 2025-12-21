import { useState } from 'react';
import { motion } from 'framer-motion';
import { PaperTexture } from './PaperTexture';

export function Envelope({ onOpen, isOpen, guestName, onNameSubmit }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [nameEntered, setNameEntered] = useState(false);

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

      // Format name properly
      const properName = name.trim().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      if (!found) {
        // Graceful: show message but still allow
        setError("We couldn't find your name on our list, but please enjoy the invitation!");
      }

      // Small delay to show message if there was one
      setTimeout(() => {
        onNameSubmit(properName);
        setNameEntered(true);
      }, found ? 0 : 1500);

    } catch (err) {
      // If fetch fails, just accept the name
      const properName = name.trim().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      onNameSubmit(properName);
      setNameEntered(true);
    }

    setIsValidating(false);
  };

  return (
    <motion.div
      className="relative"
      style={{ perspective: '1200px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isOpen ? 0 : 1,
        y: isOpen ? 80 : 0,
        scale: isOpen ? 0.9 : 1,
      }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Envelope shadow */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2"
        style={{
          width: '85%',
          height: '40px',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, transparent 70%)',
          filter: 'blur(12px)',
        }}
      />

      {/* Envelope container */}
      <div
        className="relative w-[440px] max-w-[88vw]"
        style={{ aspectRatio: '1.35' }}
      >
        {/* Envelope body */}
        <div className="absolute inset-0 overflow-hidden rounded-sm">
          <PaperTexture />

          {/* Subtle border */}
          <div
            className="absolute inset-0 pointer-events-none rounded-sm"
            style={{
              boxShadow: 'inset 0 0 0 1px rgba(139, 119, 101, 0.12)',
            }}
          />

          {/* Gold liner visible at top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-3"
            style={{
              background: 'linear-gradient(to bottom, rgba(212, 168, 83, 0.35), transparent)',
            }}
          />

          {/* Content area */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
            {!nameEntered ? (
              /* Name entry form */
              <motion.div
                className="w-full max-w-[280px] text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <p className="font-serif text-2xl md:text-3xl text-charcoal/80 italic mb-1">
                  Shriya & Neil
                </p>
                <p className="font-sans text-[10px] text-charcoal/50 tracking-[0.25em] uppercase mb-8">
                  Wedding Celebration
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-white/40 border border-charcoal/15 rounded text-center font-serif text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:border-golden/50 focus:bg-white/60 transition-all text-lg"
                      autoFocus
                      autoComplete="name"
                    />
                  </div>

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
            ) : (
              /* Guest name displayed - ready to open */
              <motion.div
                className="text-center cursor-pointer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                onClick={onOpen}
              >
                <p className="font-serif text-3xl md:text-4xl text-charcoal italic tracking-wide">
                  {guestName}
                </p>
                <motion.p
                  className="mt-6 font-sans text-[10px] text-charcoal/45 tracking-[0.3em] uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  Tap to open
                </motion.p>
              </motion.div>
            )}
          </div>

          {/* Inner shadow for depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.04), inset 0 -2px 10px rgba(0,0,0,0.02)',
            }}
          />
        </div>

        {/* Envelope flap */}
        <motion.div
          className="absolute left-0 right-0 origin-bottom"
          style={{
            top: '-35%',
            height: '45%',
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateX: isOpen ? 180 : 0,
          }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Flap front (cream paper) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: 'polygon(0 100%, 50% 15%, 100% 100%)',
              backfaceVisibility: 'hidden',
            }}
          >
            <PaperTexture />

            {/* Fold shadow at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-6"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.06), transparent)',
              }}
            />

            {/* Edge highlight */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: 'polygon(0 100%, 50% 15%, 100% 100%)',
                boxShadow: 'inset 0 -2px 4px rgba(255,255,255,0.5)',
              }}
            />
          </div>

          {/* Flap back (gold liner) */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 100%, 50% 15%, 100% 100%)',
              backfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              background: 'linear-gradient(160deg, #E8DBC0 0%, #D4B870 30%, #C9A855 60%, #B8943F 100%)',
            }}
          >
            {/* Gold texture/shimmer */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
              }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
