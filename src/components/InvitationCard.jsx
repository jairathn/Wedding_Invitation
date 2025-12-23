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

      {/* Main card - portrait proportions (approximately 8.5 x 11 ratio = 0.77) */}
      <div
        className="relative overflow-hidden rounded-sm"
        style={{
          width: 'min(480px, 92vw, 68.25vh)',
          aspectRatio: '0.75',
          maxHeight: '91vh',
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

        {/* Card content with generous padding and equal margins */}
        <div
          className="relative h-full flex flex-col"
          style={{
            padding: `clamp(8px, 2.5vh, 19px) clamp(8px, 2.55vw, 16.5px)`
          }}
        >

          {/* Top section - separate elements for progressive reveal */}
          <div className="flex-shrink-0" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.5px, 0.46875vh, 3px)', marginTop: 'clamp(4px, 1vh, 8px)' }}>
            {/* Header - "Together with their families" */}
            <motion.p
              className="text-center font-sans text-charcoal/60 tracking-[0.3em] uppercase"
              style={{ fontSize: 'clamp(8px, 1.5vw, 10px)' }}
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
              className="text-center font-serif text-charcoal italic tracking-wide"
              style={{ fontSize: 'clamp(42px, 9.5vw, 64px)' }}
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
            <div style={{ height: 'clamp(1px, 0.3125vh, 2px)' }} />

            {/* Subtitle - "Request the pleasure of your company" */}
            <motion.p
              className="text-center font-sans text-charcoal/60 tracking-[0.25em] uppercase"
              style={{ fontSize: 'clamp(8px, 1.5vw, 10px)' }}
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
              className="flex items-center justify-center"
              style={{ paddingTop: 'clamp(2.5px, 0.625vh, 4px)' }}
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
          <div style={{ height: 'clamp(3px, 1vh, 8px)' }} />

          {/* Middle section - Video */}
          <motion.div
            className="flex-shrink-0 flex flex-col justify-center"
            style={{ padding: 'clamp(3px, 1.25vh, 8px) 0' }}
            initial={{ opacity: 0, y: 25 }}
            animate={{
              opacity: isVisible && emergenceProgress > 0.4 ? 1 : 0,
              y: isVisible && emergenceProgress > 0.4 ? 0 : 25
            }}
            transition={{ delay: 0.85, duration: 0.6 }}
          >
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

          {/* Spacing after video */}
          <div style={{ height: 'clamp(3px, 1vh, 8px)' }} />

          {/* Bottom section - separate elements for progressive reveal */}
          <div className="flex-shrink-0" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2px, 0.475vh, 3px)' }}>
            {/* Date */}
            <motion.p
              className="text-center font-serif text-charcoal italic"
              style={{ fontSize: 'clamp(22px, 4.95vw, 32px)' }}
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
            <div style={{ height: 'clamp(1.5px, 0.375vh, 3px)' }} />

            {/* Location - larger text */}
            <motion.p
              className="text-center font-sans text-charcoal/55 tracking-wider"
              style={{ fontSize: 'clamp(13px, 2.5vw, 16px)' }}
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
            <div style={{ height: 'clamp(1.5px, 0.375vh, 3px)' }} />

            {/* Hashtag - larger text */}
            <motion.p
              className="text-center font-serif italic"
              style={{ color: '#B8943F', fontSize: 'clamp(14px, 2.8vw, 18px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible && emergenceProgress > 0.75 ? 1 : 0 }}
              transition={{ delay: 1.05, duration: 0.5 }}
            >
              #JayWalkingToJairath
            </motion.p>

            {/* Spacing before RSVP */}
            <div style={{ height: 'clamp(3px, 0.75vh, 6px)' }} />

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

            {/* Spacing after RSVP to match lateral margins */}
            <div style={{ height: 'clamp(12px, 3.83vw, 25px)' }} />
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
