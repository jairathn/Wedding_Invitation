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
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/*
        Animation architecture:
        - Card starts below/behind envelope, hidden
        - On open: card rises UP while envelope drops DOWN and fades
        - Creates the illusion of card emerging from envelope
      */}
      <div className="relative" style={{ perspective: '1500px' }}>

        {/* Card layer - starts below, rises up when opened */}
        <motion.div
          className="relative"
          style={{ zIndex: isOpen ? 30 : 5 }}
          initial={{ y: 100, opacity: 0 }}
          animate={{
            y: isOpen ? 0 : 100,
            opacity: isOpen ? 1 : 0,
          }}
          transition={{
            duration: 1.2,
            delay: isOpen ? 0.3 : 0,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <InvitationCard isVisible={isOpen} animateUp={true} />
        </motion.div>

        {/* Envelope layer - overlays initially, drops away when opened */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: isOpen ? 10 : 20 }}
          initial={{ opacity: 1, y: 0 }}
          animate={{
            opacity: isOpen ? 0 : 1,
            y: isOpen ? 300 : 0,
            scale: isOpen ? 0.7 : 1,
          }}
          transition={{
            duration: 1.2,
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

        {/* Envelope peek at bottom after opening - gold liner visible */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            bottom: '-120px',
            zIndex: 1,
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: isOpen ? 0.7 : 0,
            y: isOpen ? 0 : 50,
          }}
          transition={{
            delay: isOpen ? 1 : 0,
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {/* Simplified gold envelope peek */}
          <div
            className="relative"
            style={{
              width: '280px',
              height: '70px',
            }}
          >
            {/* Gold liner shape */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, #D4B870 0%, #B8943F 100%)',
                clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0 100%)',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
              }}
            >
              {/* Shimmer */}
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
