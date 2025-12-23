import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Envelope } from './Envelope';
import { InvitationCard } from './InvitationCard';

export function WeddingInvitation({ onEnvelopeOpen }) {
  const [guestName, setGuestName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [emergenceProgress, setEmergenceProgress] = useState(0);

  const handleNameSubmit = (name) => {
    setGuestName(name);
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Trigger carousel to show
    if (onEnvelopeOpen) {
      onEnvelopeOpen();
    }
    // Simulate emergence progress over time
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.02;
      setEmergenceProgress(Math.min(progress, 1));
      if (progress >= 1) clearInterval(interval);
    }, 30); // Update every 30ms for smooth progression
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/*
        Multi-step animation architecture:
        1. Flap opens (0.8s) - triggered by name submit in Envelope
        2. Envelope slides down + Card emerges up simultaneously (1.5s) - starts after flap opens
        3. Card centers, envelope fades (1.0s) - final position
        Total: ~3.3s for full sequence
      */}
      <div className="relative" style={{ perspective: '1500px' }}>

        {/* Card layer - emerges from envelope */}
        <motion.div
          className="relative"
          style={{ zIndex: isOpen ? 30 : 5 }}
          initial={{ y: 200, opacity: 0 }}
          animate={{
            y: isOpen ? 0 : 200,
            opacity: isOpen ? 1 : 0,
          }}
          transition={{
            duration: 1.5,
            delay: isOpen ? 0.9 : 0, // Start after flap opens (0.8s) + small gap (0.1s)
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <InvitationCard
            isVisible={isOpen}
            animateUp={true}
            emergenceProgress={emergenceProgress}
          />
        </motion.div>

        {/* Envelope layer - stays centered initially, slides down during emergence */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: isOpen ? 10 : 20 }}
          initial={{ opacity: 1, y: 0 }}
          animate={{
            opacity: isOpen ? 0 : 1,
            y: isOpen ? 180 : 0, // Slides down less dramatically
            scale: isOpen ? 0.85 : 1,
          }}
          transition={{
            opacity: {
              duration: 1.0,
              delay: isOpen ? 2.4 : 0, // Fade out at end
              ease: 'easeOut',
            },
            y: {
              duration: 1.5,
              delay: isOpen ? 0.9 : 0, // Slide down with card emergence
              ease: [0.4, 0, 0.2, 1],
            },
            scale: {
              duration: 1.5,
              delay: isOpen ? 0.9 : 0,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
        >
          <Envelope
            onOpen={handleOpen}
            isOpen={isOpen}
            guestName={guestName}
            onNameSubmit={handleNameSubmit}
          />
        </motion.div>
      </div>
    </div>
  );
}
