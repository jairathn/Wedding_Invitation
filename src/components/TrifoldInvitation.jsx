import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClosedInvitation } from './ClosedInvitation';
import { NameEntryModal } from './NameEntryModal';
import { OpenedInvitation } from './OpenedInvitation';
import { PaperTexture } from './PaperTexture';

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
    }, 1200);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {/* Closed Invitation */}
        {state === 'closed' && (
          <motion.div
            key="closed"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <ClosedInvitation onOpen={handleOpenClick} />
          </motion.div>
        )}

        {/* Name Entry Modal over closed invitation */}
        {state === 'entering-name' && (
          <motion.div
            key="entering"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <ClosedInvitation onOpen={() => {}} />
            <NameEntryModal isOpen={true} onValidName={handleValidName} />
          </motion.div>
        )}

        {/* Opening Animation */}
        {state === 'opening' && (
          <motion.div
            key="opening"
            className="min-h-screen flex items-center justify-center p-6"
            style={{ perspective: '1500px' }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
              {/* Left half of photo - folds outward to the left */}
              <motion.div
                className="absolute top-0 right-1/2 origin-right overflow-hidden rounded-l-md shadow-xl"
                style={{
                  width: '180px',
                  height: '320px',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -150 }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Photo left half */}
                <div className="w-full h-full relative">
                  <PaperTexture />
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src="/images/engagement-photo.jpg"
                      alt=""
                      className="absolute top-0 left-0 h-full object-cover"
                      style={{ width: '360px', objectPosition: 'left center' }}
                    />
                  </div>
                  {/* Vignette */}
                  <div
                    className="absolute inset-0"
                    style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)' }}
                  />
                </div>
              </motion.div>

              {/* Right half of photo - folds outward to the right */}
              <motion.div
                className="absolute top-0 left-1/2 origin-left overflow-hidden rounded-r-md shadow-xl"
                style={{
                  width: '180px',
                  height: '320px',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 150 }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Photo right half */}
                <div className="w-full h-full relative">
                  <PaperTexture />
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src="/images/engagement-photo.jpg"
                      alt=""
                      className="absolute top-0 right-0 h-full object-cover"
                      style={{ width: '360px', objectPosition: 'right center' }}
                    />
                  </div>
                  {/* Vignette */}
                  <div
                    className="absolute inset-0"
                    style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)' }}
                  />
                </div>
              </motion.div>

              {/* Center reveal - what's "behind" the photo */}
              <motion.div
                className="relative overflow-hidden rounded-md"
                style={{
                  width: '360px',
                  height: '320px',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <PaperTexture darker />
                <div className="relative h-full flex items-center justify-center">
                  <motion.p
                    className="font-serif text-2xl text-charcoal/70 italic text-center px-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    Welcome, {guestName}
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Opened Trifold */}
        {state === 'opened' && (
          <motion.div
            key="opened"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <OpenedInvitation guestName={guestName} isAnimating={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
