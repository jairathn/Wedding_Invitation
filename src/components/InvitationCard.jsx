import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { RSVPButton } from './RSVPButton';
import { PaperTexture } from './PaperTexture';

export function InvitationCard({ guestName }) {
  return (
    <div className="relative">
      {/* Card shadow */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2"
        style={{
          width: '85%',
          height: '40px',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />

      {/* Main card */}
      <div
        className="relative overflow-hidden"
        style={{
          width: '400px',
          maxWidth: '90vw',
          borderRadius: '3px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1), 0 8px 40px rgba(0,0,0,0.08)',
        }}
      >
        {/* Deckled edge effect - subtle wavy border */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            border: '1px solid rgba(139, 119, 101, 0.15)',
            borderRadius: '3px',
            // Deckled edge simulation with shadow
            boxShadow: `
              inset 1px 0 0 rgba(255,255,255,0.5),
              inset -1px 0 0 rgba(255,255,255,0.5),
              inset 0 1px 0 rgba(255,255,255,0.5),
              inset 0 -1px 0 rgba(255,255,255,0.5)
            `,
          }}
        />

        {/* Paper texture */}
        <PaperTexture />

        {/* Gold foil top accent */}
        <div
          className="relative h-1"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(212,168,83,0.6) 20%, rgba(232,198,123,0.8) 50%, rgba(212,168,83,0.6) 80%, transparent 100%)',
          }}
        />

        {/* Card content */}
        <div className="relative px-10 py-12 md:px-12 md:py-14">
          {/* Welcome line */}
          <motion.p
            className="text-center font-sans text-xs text-charcoal/50 tracking-[0.25em] uppercase mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Together with their families
          </motion.p>

          {/* Names - the hero */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1
              className="font-serif text-4xl md:text-5xl text-charcoal italic mb-3"
              style={{
                // Gold foil shimmer effect
                background: 'linear-gradient(135deg, #2C2C2C 0%, #4A4A4A 25%, #2C2C2C 50%, #4A4A4A 75%, #2C2C2C 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                letterSpacing: '0.02em',
              }}
            >
              Shriya & Neil
            </h1>
            <p className="font-sans text-xs text-charcoal/60 tracking-[0.2em] uppercase">
              Request the pleasure of your company
            </p>
          </motion.div>

          {/* Decorative divider */}
          <motion.div
            className="flex items-center justify-center mb-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-golden/50" />
            <div className="mx-3">
              <svg width="12" height="12" viewBox="0 0 12 12" className="text-golden">
                <path
                  fill="currentColor"
                  d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z"
                />
              </svg>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-golden/50" />
          </motion.div>

          {/* Video section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <p className="text-center font-sans text-xs text-charcoal/50 tracking-[0.2em] uppercase mb-4">
              Our Story
            </p>
            <div className="relative">
              {/* Elegant frame */}
              <div
                className="absolute -inset-3 rounded"
                style={{
                  border: '1px solid rgba(212, 168, 83, 0.25)',
                }}
              />
              <div className="rounded overflow-hidden">
                <VideoPlayer />
              </div>
            </div>
          </motion.div>

          {/* Event details */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="font-serif text-2xl md:text-3xl text-charcoal italic mb-2">
              September 9 – 11, 2026
            </p>
            <p className="font-sans text-sm text-charcoal/70 tracking-wide">
              Barcelona, Spain
            </p>
          </motion.div>

          {/* Hashtag */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <p
              className="font-serif text-lg italic"
              style={{
                color: '#B8943F',
              }}
            >
              #JayWalkingToJairath
            </p>
          </motion.div>

          {/* Divider */}
          <motion.div
            className="flex items-center justify-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.4 }}
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-golden/40 to-transparent" />
          </motion.div>

          {/* RSVP */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <RSVPButton />
          </motion.div>
        </div>

        {/* Gold foil bottom accent */}
        <div
          className="relative h-1"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(212,168,83,0.6) 20%, rgba(232,198,123,0.8) 50%, rgba(212,168,83,0.6) 80%, transparent 100%)',
          }}
        />
      </div>
    </div>
  );
}
