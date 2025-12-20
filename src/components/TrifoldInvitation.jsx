import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClosedInvitation } from './ClosedInvitation';
import { NameEntryModal } from './NameEntryModal';
import { OpenedInvitation } from './OpenedInvitation';

export function TrifoldInvitation() {
  const [state, setState] = useState('closed'); // 'closed' | 'entering-name' | 'opening' | 'opened'
  const [guestName, setGuestName] = useState('');

  const handleOpenClick = () => {
    setState('entering-name');
  };

  const handleValidName = (name) => {
    setGuestName(name);
    setState('opening');

    // After opening animation completes, transition to opened state
    setTimeout(() => {
      setState('opened');
    }, 2500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4">
      <AnimatePresence mode="wait">
        {/* Closed Invitation */}
        {state === 'closed' && (
          <motion.div
            key="closed"
            className="w-full"
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
          >
            <ClosedInvitation onOpen={handleOpenClick} />
          </motion.div>
        )}

        {/* Name Entry - Shows modal over closed invitation */}
        {state === 'entering-name' && (
          <motion.div
            key="entering"
            className="w-full"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <ClosedInvitation onOpen={() => {}} />
            <NameEntryModal isOpen={true} onValidName={handleValidName} />
          </motion.div>
        )}

        {/* Opening Animation - Photo splits and folds outward */}
        {state === 'opening' && (
          <motion.div
            key="opening"
            className="w-full flex justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <PhotoSplitAnimation />
          </motion.div>
        )}

        {/* Opened Invitation - Three panel layout */}
        {state === 'opened' && (
          <motion.div
            key="opened"
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <OpenedInvitation guestName={guestName} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhotoSplitAnimation() {
  return (
    <div className="relative w-full max-w-lg mx-auto px-6" style={{ perspective: '1500px' }}>
      {/* Container for the split photo animation */}
      <div className="relative">
        {/* Background reveal - the textured paper that appears behind */}
        <motion.div
          className="absolute inset-0 rounded-sm overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, #FFFEF9 0%, #F5F0E6 50%, #FAF7F2 100%)',
          }}
        >
          {/* Paper texture */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Revealed content preview */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="text-center px-8">
              <p className="font-serif text-3xl md:text-4xl text-golden italic mb-4">S & N</p>
              <p className="font-serif text-xl md:text-2xl text-charcoal italic mb-3">
                Shriya & Neil
              </p>
              <p className="font-sans text-sm text-charcoal-light tracking-wide">
                joyfully request the pleasure of your company
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Photo container - this will split */}
        <div className="relative aspect-[3/4] overflow-visible">
          {/* LEFT half of photo - folds outward to the left */}
          <motion.div
            className="absolute top-0 left-0 w-1/2 h-full overflow-hidden origin-right"
            style={{
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: -160 }}
            transition={{
              duration: 1.8,
              ease: [0.43, 0.13, 0.23, 0.96],
              delay: 0.2,
            }}
          >
            {/* Photo (left half) */}
            <div className="absolute inset-0 bg-charcoal">
              <img
                src="/images/engagement-photo.jpg"
                alt=""
                className="absolute top-0 left-0 w-[200%] h-full object-cover"
              />
              {/* Vignette */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to right, rgba(44,44,44,0.1) 0%, transparent 50%)',
                }}
              />
            </div>

            {/* Fold shadow */}
            <motion.div
              className="absolute top-0 right-0 w-8 h-full"
              style={{
                background: 'linear-gradient(to left, rgba(0,0,0,0.3), transparent)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
          </motion.div>

          {/* RIGHT half of photo - folds outward to the right */}
          <motion.div
            className="absolute top-0 right-0 w-1/2 h-full overflow-hidden origin-left"
            style={{
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 160 }}
            transition={{
              duration: 1.8,
              ease: [0.43, 0.13, 0.23, 0.96],
              delay: 0.2,
            }}
          >
            {/* Photo (right half) */}
            <div className="absolute inset-0 bg-charcoal">
              <img
                src="/images/engagement-photo.jpg"
                alt=""
                className="absolute top-0 right-0 w-[200%] h-full object-cover"
                style={{ objectPosition: 'right center' }}
              />
              {/* Vignette */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to left, rgba(44,44,44,0.1) 0%, transparent 50%)',
                }}
              />
            </div>

            {/* Fold shadow */}
            <motion.div
              className="absolute top-0 left-0 w-8 h-full"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
          </motion.div>

          {/* Center split line - appears as photos separate */}
          <motion.div
            className="absolute top-0 left-1/2 w-px h-full bg-golden/30 -translate-x-1/2"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </div>

        {/* Decorative elements that appear during opening */}
        <motion.div
          className="absolute -inset-3 border border-golden/30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        />
      </div>
    </div>
  );
}
