import { useState } from 'react';
import { motion } from 'framer-motion';
import { Envelope } from './Envelope';
import { InvitationCard } from './InvitationCard';

export function WeddingInvitation() {
  const [guestName, setGuestName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleNameSubmit = (name) => {
    setGuestName(name);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/*
        Layered architecture:
        - Card is always in final position (z-index: 10)
        - Envelope overlays card initially (z-index: 20)
        - When isOpen: envelope fades/drops, revealing card
        - Single continuous motion, no teleporting
      */}
      <div className="relative">
        {/* Card layer - always in position, revealed when envelope opens */}
        <div className="relative z-10">
          <InvitationCard isVisible={isOpen} />
        </div>

        {/* Envelope layer - overlays card, fades away on open */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{
            opacity: isOpen ? 0 : 1,
            y: isOpen ? 100 : 0,
            scale: isOpen ? 0.85 : 1,
            pointerEvents: isOpen ? 'none' : 'auto',
          }}
          transition={{
            duration: 1,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <Envelope
            onOpen={handleOpen}
            isOpen={isOpen}
            guestName={guestName}
            onNameSubmit={handleNameSubmit}
          />
        </motion.div>

        {/* Lingering envelope hint at bottom after opening */}
        {isOpen && (
          <motion.div
            className="absolute -bottom-32 left-1/2 -translate-x-1/2 z-5 pointer-events-none"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {/* Simplified envelope peek - just the gold liner visible */}
            <div
              className="w-[300px] h-[80px] rounded-sm overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #E8DBC0 0%, #D4B870 30%, #C9A855 60%, #B8943F 100%)',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)',
              }}
            >
              {/* Gold shimmer */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
