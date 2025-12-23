import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { RSVPButton } from './RSVPButton';
import { PaperTexture } from './PaperTexture';

export function InvitationCard({ isVisible, animateUp, emergenceProgress = 1 }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: animateUp ? 200 : 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : (animateUp ? 200 : 0),
      }}
      transition={{
        duration: 1.5,
        delay: isVisible ? 0.4 : 0,
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

      {/* Main card - portrait proportions with responsive height */}
      <div
        className="relative w-[480px] max-w-[92vw] overflow-hidden rounded-sm"
        style={{
          height: 'min(640px, 85vh)',
          maxHeight: '85vh',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 12px 48px rgba(0,0,0,0.1)',
        }}
      >
        {/* Paper texture */}
        <PaperTexture />

        {/* Top gold accent line */}
        <div
          className="relative h-[2px] sm:h-[3px]"
          style={{
            background: 'linear-gradient(90deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.6) 50%, rgba(212,168,83,0.2) 100%)',
          }}
        />

        {/* Card content with responsive padding */}
        <div className="relative h-full flex flex-col px-6 py-6 sm:px-10 sm:py-8 md:px-16 md:py-10 overflow-y-auto">

          {/* Top section - separate elements for progressive reveal */}
          <div className="flex-shrink-0 space-y-3 sm:space-y-4 md:space-y-6" style={{ marginTop: '0.5rem' }}>
            {/* Header - "Together with their families" */}
            <motion.p
              className="text-center font-sans text-[8px] sm:text-[9px] md:text-[10px] text-charcoal/60 tracking-[0.25em] sm:tracking-[0.3em] uppercase"
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: isVisible && emergenceProgress > 0.1 ? 1 : 0,
                y: isVisible && emergenceProgress > 0.1 ? 0 : 15
              }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Together with their families
            </motion.p>

            {/* Names - THE HERO */}
            <motion.h1
              className="text-center font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-charcoal italic tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isVisible && emergenceProgress > 0.15 ? 1 : 0,
                y: isVisible && emergenceProgress > 0.15 ? 0 : 20
              }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Shriya & Neil
            </motion.h1>

            {/* Extra spacing before subtitle */}
            <div className="h-2 sm:h-3 md:h-4" />

            {/* Subtitle - "Request the pleasure of your company" */}
            <motion.p
              className="text-center font-sans text-[8px] sm:text-[9px] md:text-[10px] text-charcoal/60 tracking-[0.2em] sm:tracking-[0.25em] uppercase"
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: isVisible && emergenceProgress > 0.2 ? 1 : 0,
                y: isVisible && emergenceProgress > 0.2 ? 0 : 15
              }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              Request the pleasure of your company
            </motion.p>

            {/* Decorative divider */}
            <motion.div
              className="flex items-center justify-center pt-4"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{
                opacity: isVisible && emergenceProgress > 0.25 ? 1 : 0,
                scaleX: isVisible && emergenceProgress > 0.25 ? 1 : 0
              }}
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

          {/* Spacing before video */}
          <div className="h-4 sm:h-6 md:h-8" />

          {/* Middle section - Video */}
          <motion.div
            className="flex-shrink-0 flex flex-col justify-center py-3 sm:py-4 md:py-6"
            initial={{ opacity: 0, y: 25 }}
            animate={{
              opacity: isVisible && emergenceProgress > 0.4 ? 1 : 0,
              y: isVisible && emergenceProgress > 0.4 ? 0 : 25
            }}
            transition={{ delay: 0.85, duration: 0.6 }}
          >
            {/* Video container - centered with frame */}
            <div className="flex justify-center">
              <div className="relative w-full sm:w-[85%] md:w-[80%]">
                {/* Elegant frame */}
                <div
                  className="absolute -inset-2 sm:-inset-3 rounded-sm pointer-events-none"
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

          {/* Spacing after video */}
          <div className="h-4 sm:h-6 md:h-8" />

          {/* Bottom section - separate elements for progressive reveal */}
          <div className="flex-shrink-0 space-y-2 sm:space-y-2.5 md:space-y-3">
            {/* Date */}
            <motion.p
              className="text-center font-serif text-xl sm:text-2xl md:text-3xl text-charcoal italic"
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: isVisible && emergenceProgress > 0.65 ? 1 : 0,
                y: isVisible && emergenceProgress > 0.65 ? 0 : 15
              }}
              transition={{ delay: 0.95, duration: 0.5 }}
            >
              September 9 – 11, 2026
            </motion.p>

            {/* Spacing after date */}
            <div className="h-1.5 sm:h-2 md:h-3" />

            {/* Location - larger text */}
            <motion.p
              className="text-center font-sans text-sm sm:text-base md:text-base text-charcoal/55 tracking-wider"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isVisible && emergenceProgress > 0.7 ? 1 : 0,
                y: isVisible && emergenceProgress > 0.7 ? 0 : 10
              }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              Barcelona, Spain
            </motion.p>

            {/* Spacing after location */}
            <div className="h-1.5 sm:h-2 md:h-3" />

            {/* Hashtag - larger text */}
            <motion.p
              className="text-center font-serif text-base sm:text-lg md:text-lg italic"
              style={{ color: '#B8943F' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible && emergenceProgress > 0.75 ? 1 : 0 }}
              transition={{ delay: 1.05, duration: 0.5 }}
            >
              #JayWalkingToJairath
            </motion.p>

            {/* Spacing before RSVP */}
            <div className="h-3 sm:h-4 md:h-6" />

            {/* RSVP Button - larger, more prominent, separated */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: isVisible && emergenceProgress > 0.85 ? 1 : 0,
                y: isVisible && emergenceProgress > 0.85 ? 0 : 15
              }}
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
