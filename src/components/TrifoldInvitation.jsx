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

    // After animation completes, switch to opened state
    setTimeout(() => {
      setState('opened');
    }, 1800);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-8 px-4">
      <AnimatePresence mode="wait">
        {/* Closed Invitation */}
        {state === 'closed' && (
          <motion.div
            key="closed"
            exit={{
              opacity: 0,
              scale: 0.95,
              transition: { duration: 0.3 }
            }}
          >
            <ClosedInvitation onOpen={handleOpenClick} />
          </motion.div>
        )}

        {/* Name Entry Modal shows over closed invitation */}
        {state === 'entering-name' && (
          <motion.div
            key="entering"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ClosedInvitation onOpen={() => {}} />
            <NameEntryModal
              isOpen={true}
              onValidName={handleValidName}
            />
          </motion.div>
        )}

        {/* Opening Animation */}
        {state === 'opening' && (
          <motion.div
            key="opening"
            className="w-full max-w-md mx-auto perspective-1500"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TrifoldOpeningAnimation />
          </motion.div>
        )}

        {/* Opened Invitation */}
        {state === 'opened' && (
          <motion.div
            key="opened"
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <OpenedInvitation guestName={guestName} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrifoldOpeningAnimation() {
  return (
    <div className="relative" style={{ perspective: '1500px' }}>
      {/* Center panel (stays in place) */}
      <motion.div
        className="relative bg-warm-white rounded-lg shadow-2xl overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-1 bg-gradient-to-r from-terracotta via-golden to-terracotta" />
        <div className="px-6 py-12 md:px-10 md:py-16 flex flex-col items-center justify-center min-h-[400px]">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="font-serif text-3xl md:text-4xl text-golden italic mb-4">
              S & N
            </p>
            <p className="font-serif text-xl md:text-2xl text-charcoal italic">
              Shriya & Neil
            </p>
            <p className="font-sans text-sm text-charcoal-light mt-4 tracking-wider">
              request the pleasure of your company
            </p>
          </motion.div>
        </div>
        <div className="h-1 bg-gradient-to-r from-terracotta via-golden to-terracotta" />
      </motion.div>

      {/* Left panel (folds outward) */}
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-full bg-warm-white rounded-l-lg shadow-xl overflow-hidden origin-right"
        style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: -180 }}
        transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <div className="h-full flex items-center justify-center bg-gradient-to-r from-cream to-warm-white">
          <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-terracotta to-golden" />
          <div className="h-1 absolute bottom-0 left-0 right-0 bg-gradient-to-r from-terracotta to-golden" />
        </div>
      </motion.div>

      {/* Right panel (folds outward) */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full bg-warm-white rounded-r-lg shadow-xl overflow-hidden origin-left"
        style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 180 }}
        transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96], delay: 0.1 }}
      >
        <div className="h-full flex items-center justify-center bg-gradient-to-l from-cream to-warm-white">
          <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-l from-terracotta to-golden" />
          <div className="h-1 absolute bottom-0 left-0 right-0 bg-gradient-to-l from-terracotta to-golden" />
        </div>
      </motion.div>
    </div>
  );
}
