import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { RSVPButton } from './RSVPButton';
import { PaperTexture } from './PaperTexture';

export function InvitationCard({ isVisible, animateUp }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: animateUp ? 200 : 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : (animateUp ? 200 : 0),
      }}
      transition={{
        duration: 1.2,
        delay: isVisible ? 0.2 : 0,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {/* Card shadow - layered for depth */}
      <div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '85%',
          height: '60px',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Main card - portrait proportions (approximately 8.5 x 11 ratio = 0.77) */}
      <div
        className="relative w-[480px] max-w-[92vw] overflow-hidden rounded-sm"
        style={{
          aspectRatio: '0.75',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 12px 48px rgba(0,0,0,0.1)',
        }}
      >
        {/* Paper texture */}
        <PaperTexture />

        {/* Top gold accent line */}
        <div
          className="relative h-[3px]"
          style={{
            background: 'linear-gradient(90deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.6) 50%, rgba(212,168,83,0.2) 100%)',
          }}
        />

        {/* Card content with generous padding */}
        <div className="relative h-full flex flex-col px-12 py-14 md:px-16 md:py-16">

          {/* Top section */}
          <div className="flex-shrink-0">
            {/* Header */}
            <motion.p
              className="text-center font-sans text-[10px] text-charcoal/40 tracking-[0.3em] uppercase mb-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 15 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Together with their families
            </motion.p>

            {/* Names - THE HERO */}
            <motion.h1
              className="text-center font-serif text-5xl md:text-6xl text-charcoal italic tracking-wide mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Shriya & Neil
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-center font-sans text-[10px] text-charcoal/45 tracking-[0.25em] uppercase mb-10"
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
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-golden/40" />
              <div className="mx-3">
                <svg width="8" height="8" viewBox="0 0 8 8" className="text-golden/60">
                  <path
                    fill="currentColor"
                    d="M4 0L4.9 3.1L8 4L4.9 4.9L4 8L3.1 4.9L0 4L3.1 3.1L4 0Z"
                  />
                </svg>
              </div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-golden/40" />
            </motion.div>
          </div>

          {/* Middle section - Video (flex-grow to take available space) */}
          <motion.div
            className="flex-grow flex flex-col justify-center mb-10"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 25 }}
            transition={{ delay: 0.85, duration: 0.6 }}
          >
            {/* Video label */}
            <p className="text-center font-sans text-[9px] text-charcoal/35 tracking-[0.3em] uppercase mb-4">
              Our Story
            </p>

            {/* Video container - centered with frame */}
            <div className="flex justify-center">
              <div className="relative w-[80%]">
                {/* Elegant frame */}
                <div
                  className="absolute -inset-3 rounded-sm pointer-events-none"
                  style={{
                    border: '1px solid rgba(212, 168, 83, 0.2)',
                  }}
                />
                <div className="rounded-sm overflow-hidden">
                  <VideoPlayer />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom section */}
          <div className="flex-shrink-0">
            {/* Date */}
            <motion.p
              className="text-center font-serif text-2xl md:text-3xl text-charcoal italic mb-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 15 }}
              transition={{ delay: 0.95, duration: 0.5 }}
            >
              September 9 – 11, 2026
            </motion.p>

            {/* Location */}
            <motion.p
              className="text-center font-sans text-xs text-charcoal/55 tracking-wider mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              Barcelona, Spain
            </motion.p>

            {/* Hashtag */}
            <motion.p
              className="text-center font-serif text-base italic mb-8"
              style={{ color: '#B8943F' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ delay: 1.05, duration: 0.5 }}
            >
              #JayWalkingToJairath
            </motion.p>

            {/* Subtle divider before RSVP */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-golden/25 to-transparent" />
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
        </div>

        {/* Bottom gold accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{
            background: 'linear-gradient(90deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.6) 50%, rgba(212,168,83,0.2) 100%)',
          }}
        />
      </div>
    </motion.div>
  );
}
