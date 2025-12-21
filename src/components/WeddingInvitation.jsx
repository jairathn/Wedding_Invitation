import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Envelope } from './Envelope';
import { InvitationCard } from './InvitationCard';
import { NameEntryModal } from './NameEntryModal';
import { PaperTexture } from './PaperTexture';

export function WeddingInvitation() {
  const [state, setState] = useState('entering-name'); // 'entering-name' | 'envelope' | 'opening' | 'card'
  const [guestName, setGuestName] = useState('');

  const handleValidName = (name) => {
    setGuestName(name);
    setState('envelope');
  };

  const handleOpenEnvelope = () => {
    setState('opening');
    // After flap opens, slide card up
    setTimeout(() => {
      setState('card');
    }, 1800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {/* Name Entry */}
        {state === 'entering-name' && (
          <motion.div
            key="name-entry"
            className="w-full max-w-md"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            {/* Simple elegant name entry card */}
            <div className="relative">
              <div
                className="relative overflow-hidden rounded"
                style={{
                  boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
                }}
              >
                <PaperTexture />

                {/* Gold accent top */}
                <div
                  className="relative h-1"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.5), transparent)',
                  }}
                />

                <div className="relative px-10 py-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <h1 className="font-serif text-3xl md:text-4xl text-charcoal italic mb-2">
                      Shriya & Neil
                    </h1>
                    <p className="font-sans text-xs text-charcoal/50 tracking-[0.2em] uppercase mb-8">
                      Wedding Celebration
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <p className="font-sans text-sm text-charcoal/70 mb-6">
                      Please enter your name to view your invitation
                    </p>

                    <NameEntryInline onValidName={handleValidName} />
                  </motion.div>
                </div>

                {/* Gold accent bottom */}
                <div
                  className="relative h-1"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.5), transparent)',
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Envelope View */}
        {state === 'envelope' && (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
            transition={{ duration: 0.6 }}
          >
            <Envelope
              guestName={guestName}
              isOpen={false}
              onOpen={handleOpenEnvelope}
            />
          </motion.div>
        )}

        {/* Opening Animation */}
        {state === 'opening' && (
          <motion.div
            key="opening"
            className="relative"
            style={{ perspective: '1200px' }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            {/* Envelope body stays in place */}
            <div
              className="relative overflow-hidden"
              style={{
                width: '420px',
                height: '300px',
                borderRadius: '4px',
              }}
            >
              <PaperTexture />
              <div
                className="absolute inset-0"
                style={{
                  boxShadow: 'inset 0 0 30px rgba(212, 168, 83, 0.1)',
                }}
              />
            </div>

            {/* Flap animates open */}
            <motion.div
              className="absolute left-0 right-0 origin-bottom"
              style={{
                top: '-140px',
                height: '150px',
                transformStyle: 'preserve-3d',
              }}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: 180 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Flap front */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: 'polygon(0 100%, 50% 10%, 100% 100%)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <PaperTexture />
              </div>

              {/* Flap back - gold liner */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath: 'polygon(0 100%, 50% 10%, 100% 100%)',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateX(180deg)',
                  background: 'linear-gradient(135deg, #E8D5A3 0%, #D4A853 50%, #C9973F 100%)',
                }}
              />
            </motion.div>

            {/* Card slides up out of envelope */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ bottom: '20px' }}
              initial={{ y: 0 }}
              animate={{ y: -380 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.4, 0, 0.2, 1] }}
            >
              <InvitationCard guestName={guestName} />
            </motion.div>
          </motion.div>
        )}

        {/* Final Card View */}
        {state === 'card' && (
          <motion.div
            key="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <InvitationCard guestName={guestName} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline name entry component
function NameEntryInline({ onValidName }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsChecking(true);
    setError('');

    // Load guest list and validate
    try {
      const response = await fetch('/data/guests.json');
      const guests = await response.json();

      const normalizedInput = name.trim().toLowerCase();
      const found = guests.some(guest =>
        guest.toLowerCase() === normalizedInput ||
        guest.toLowerCase().includes(normalizedInput) ||
        normalizedInput.includes(guest.toLowerCase().split(' ')[0])
      );

      if (found) {
        // Capitalize the name properly
        const properName = name.trim().split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        onValidName(properName);
      } else {
        setError('We couldn\'t find your name on the guest list. Please try again or contact the couple.');
      }
    } catch (err) {
      // If guest list fails to load, accept any name
      const properName = name.trim().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      onValidName(properName);
    }

    setIsChecking(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 bg-white/50 border border-charcoal/20 rounded text-center font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-golden/50 transition-colors"
          autoFocus
        />
      </div>

      {error && (
        <p className="text-sm text-terracotta">{error}</p>
      )}

      <button
        type="submit"
        disabled={isChecking}
        className="w-full px-6 py-3 bg-transparent border-2 border-terracotta text-terracotta font-serif italic tracking-wide rounded transition-all duration-300 hover:bg-terracotta hover:text-warm-white disabled:opacity-50"
      >
        {isChecking ? 'Checking...' : 'View Invitation'}
      </button>
    </form>
  );
}
