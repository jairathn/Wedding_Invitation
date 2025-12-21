import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { RSVPButton } from './RSVPButton';
import { PaperTexture } from './PaperTexture';

export function InvitationCard({ isVisible }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.96,
      }}
      transition={{
        duration: 0.9,
        delay: isVisible ? 0.3 : 0,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {/* Card shadow - layered for depth */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '90%',
          height: '50px',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, transparent 70%)',
          filter: 'blur(16px)',
        }}
      />

      {/* Main card */}
      <div
        className="relative w-[520px] max-w-[92vw] overflow-hidden rounded-sm"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 12px 48px rgba(0,0,0,0.1)',
        }}
      >
        {/* Paper texture */}
        <PaperTexture />

        {/* Top gold accent line */}
        <div
          className="relative h-[3px]"
          style={{
            background: 'linear-gradient(90deg, rgba(212,168,83,0.3) 0%, rgba(212,168,83,0.7) 50%, rgba(212,168,83,0.3) 100%)',
          }}
        />

        {/* Card content with generous padding */}
        <div className="relative px-12 py-16 md:px-16 md:py-20">
          {/* Header */}
          <motion.p
            className="text-center font-sans text-[11px] text-charcoal/45 tracking-[0.25em] uppercase mb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 15 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Together with their families
          </motion.p>

          {/* Names - THE HERO */}
          <motion.h1
            className="text-center font-serif text-5xl md:text-6xl text-charcoal italic tracking-wide mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Shriya & Neil
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-center font-sans text-[11px] text-charcoal/50 tracking-[0.2em] uppercase mb-10"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 15 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Request the pleasure of your company
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            className="flex items-center justify-center mb-10"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: isVisible ? 1 : 0, scaleX: isVisible ? 1 : 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-golden/40" />
            <div className="mx-4">
              <svg width="10" height="10" viewBox="0 0 10 10" className="text-golden/70">
                <path
                  fill="currentColor"
                  d="M5 0L6.12 3.88L10 5L6.12 6.12L5 10L3.88 6.12L0 5L3.88 3.88L5 0Z"
                />
              </svg>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-golden/40" />
          </motion.div>

          {/* Video section */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 25 }}
            transition={{ delay: 0.85, duration: 0.6 }}
          >
            {/* Video label */}
            <p className="text-center font-sans text-[10px] text-charcoal/40 tracking-[0.25em] uppercase mb-5">
              Our Story
            </p>

            {/* Video container - 80% width, centered */}
            <div className="flex justify-center">
              <div className="relative w-[85%]">
                {/* Elegant frame */}
                <div
                  className="absolute -inset-3 rounded-sm pointer-events-none"
                  style={{
                    border: '1px solid rgba(212, 168, 83, 0.25)',
                  }}
                />
                <div className="rounded-sm overflow-hidden shadow-sm">
                  <VideoPlayer />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Date */}
          <motion.p
            className="text-center font-serif text-2xl md:text-3xl text-charcoal italic mb-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 15 }}
            transition={{ delay: 0.95, duration: 0.5 }}
          >
            September 9 – 11, 2026
          </motion.p>

          {/* Location */}
          <motion.p
            className="text-center font-sans text-sm text-charcoal/60 tracking-wide mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            Barcelona, Spain
          </motion.p>

          {/* Hashtag */}
          <motion.p
            className="text-center font-serif text-lg italic mb-10"
            style={{ color: '#B8943F' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ delay: 1.05, duration: 0.5 }}
          >
            #JayWalkingToJairath
          </motion.p>

          {/* Subtle divider before RSVP */}
          <motion.div
            className="flex justify-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ delay: 1.1, duration: 0.4 }}
          >
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-golden/30 to-transparent" />
          </motion.div>

          {/* RSVP Button */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 15 }}
            transition={{ delay: 1.15, duration: 0.5 }}
          >
            <RSVPButton />
          </motion.div>
        </div>

        {/* Bottom gold accent line */}
        <div
          className="relative h-[3px]"
          style={{
            background: 'linear-gradient(90deg, rgba(212,168,83,0.3) 0%, rgba(212,168,83,0.7) 50%, rgba(212,168,83,0.3) 100%)',
          }}
        />
      </div>
    </motion.div>
  );
}
