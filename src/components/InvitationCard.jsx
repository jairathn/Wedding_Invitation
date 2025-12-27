import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { RSVPButton } from './RSVPButton';
import { PaperTexture } from './PaperTexture';
import personalizedMessages from '../data/personalizedMessages.json';

export function InvitationCard({ isVisible, animateUp, emergenceProgress = 1, guestName = '' }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Get personalized message for the guest, or use default
  const message = useMemo(() => {
    if (!guestName) return null;

    // Try exact match first
    if (personalizedMessages[guestName]) {
      return personalizedMessages[guestName].message;
    }

    // Try case-insensitive match
    const normalizedGuestName = guestName.toLowerCase().trim();
    const matchedKey = Object.keys(personalizedMessages).find(
      key => key.toLowerCase().trim() === normalizedGuestName
    );

    if (matchedKey) {
      return personalizedMessages[matchedKey].message;
    }

    // Return null if no personalized message (will use default)
    return null;
  }, [guestName]);

  // Default message
  const defaultMessage = "We could not be more excited to invite you to our wedding. In one way or another, without you in our lives, we would not be here today, and we hope you can join us to celebrate our special day!";

  // Use personalized message if available, otherwise use default
  const displayMessage = message || defaultMessage;

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

      {/* Flip container with 3D perspective */}
      <div
        className="relative"
        style={{
          width: 'min(432px, 82.8vw, 61.425vh)',
          aspectRatio: '0.75',
          maxHeight: '85vh',
          perspective: '2000px',
        }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {/* Front of card */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Main card - portrait proportions (approximately 8.5 x 11 ratio = 0.77) */}
            <div
              className="relative overflow-hidden rounded-sm w-full h-full"
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
            background: 'linear-gradient(90deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.6) 50%, rgba(212,168,83,0.2) 100%)',
          }}
        />

        {/* Card content with generous padding and equal margins */}
        <div
          className="relative h-full flex flex-col"
          style={{
            padding: `clamp(7.2px, 2.25vh, 17.1px) clamp(7.2px, 2.295vw, 14.85px)`
          }}
        >

          {/* Top section - separate elements for progressive reveal */}
          <div className="flex-shrink-0" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.35px, 0.421875vh, 2.7px)', marginTop: 'clamp(3.6px, 0.9vh, 7.2px)' }}>
            {/* Header - "Together with their families" */}
            <motion.p
              className="text-center font-sans text-charcoal/60 tracking-[0.3em] uppercase"
              style={{ fontSize: 'clamp(7.2px, 1.35vw, 9px)' }}
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
              style={{ fontSize: 'clamp(37.8px, 8.55vw, 57.6px)' }}
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
            <div style={{ height: 'clamp(0.9px, 0.28125vh, 1.8px)' }} />

            {/* Subtitle - "Request the pleasure of your company" */}
            <motion.p
              className="text-center font-sans text-charcoal/60 tracking-[0.25em] uppercase"
              style={{ fontSize: 'clamp(7.2px, 1.35vw, 9px)' }}
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
              style={{ paddingTop: 'clamp(2.25px, 0.5625vh, 3.6px)' }}
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
          <div style={{ height: 'clamp(2.7px, 0.9vh, 7.2px)' }} />

          {/* Middle section - Video */}
          <motion.div
            className="flex-shrink-0 flex flex-col justify-center"
            style={{ padding: 'clamp(2.7px, 1.125vh, 7.2px) 0' }}
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
                  <VideoPlayer isFlipped={isFlipped} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Spacing after video */}
          <div style={{ height: 'clamp(2.7px, 0.9vh, 7.2px)' }} />

          {/* Bottom section - separate elements for progressive reveal */}
          <div className="flex-shrink-0" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.8px, 0.4275vh, 2.7px)' }}>
            {/* Date */}
            <motion.p
              className="text-center font-serif text-charcoal italic"
              style={{ fontSize: 'clamp(19.8px, 4.455vw, 28.8px)' }}
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
            <div style={{ height: 'clamp(1.35px, 0.3375vh, 2.7px)' }} />

            {/* Location - larger text */}
            <motion.p
              className="text-center font-sans text-charcoal/55 tracking-wider"
              style={{ fontSize: 'clamp(11.7px, 2.25vw, 14.4px)' }}
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
            <div style={{ height: 'clamp(1.35px, 0.3375vh, 2.7px)' }} />

            {/* Hashtag - larger text */}
            <motion.p
              className="text-center font-serif italic"
              style={{ color: '#B8943F', fontSize: 'clamp(12.6px, 2.52vw, 16.2px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible && emergenceProgress > 0.75 ? 1 : 0 }}
              transition={{ delay: 1.05, duration: 0.5 }}
            >
              #JayWalkingToJairath
            </motion.p>

            {/* Spacing before RSVP */}
            <div style={{ height: 'clamp(2.7px, 0.675vh, 5.4px)' }} />

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

            {/* Spacing after RSVP to ensure button visibility */}
            <div style={{ height: 'clamp(16px, 4vh, 28px)' }} />
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
          </div>

          {/* Back of card */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div
              className="relative overflow-hidden rounded-sm w-full h-full"
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
                  background: 'linear-gradient(90deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.6) 50%, rgba(212,168,83,0.2) 100%)',
                }}
              />

              {/* Decorative embroidered border frame with shimmer */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Ornamental corner flourishes with animated shimmer */}
                {[
                  { pos: 'top-left', top: 'clamp(16px, 3.2vh, 24px)', left: 'clamp(20px, 4vw, 28px)' },
                  { pos: 'top-right', top: 'clamp(16px, 3.2vh, 24px)', right: 'clamp(20px, 4vw, 28px)' },
                  { pos: 'bottom-left', bottom: 'clamp(16px, 3.2vh, 24px)', left: 'clamp(20px, 4vw, 28px)' },
                  { pos: 'bottom-right', bottom: 'clamp(16px, 3.2vh, 24px)', right: 'clamp(20px, 4vw, 28px)' },
                ].map(({ pos, ...style }) => (
                  <motion.svg
                    key={pos}
                    className="absolute"
                    style={{
                      ...style,
                      width: 'clamp(70px, 14vw, 100px)',
                      height: 'clamp(70px, 14vw, 100px)',
                      filter: 'drop-shadow(0 0 6px rgba(212,168,83,0.8)) drop-shadow(0 0 12px rgba(212,168,83,0.4))',
                    }}
                    viewBox="0 0 100 100"
                    fill="none"
                  >
                    <defs>
                      <linearGradient id={`shimmer-${pos}`} x1="0%" y1="0%" x2="200%" y2="0%">
                        <stop offset="0%" stopColor="#A8842F" />
                        <stop offset="25%" stopColor="#D4B870" />
                        <stop offset="50%" stopColor="#F5E6C8" />
                        <stop offset="75%" stopColor="#D4B870" />
                        <stop offset="100%" stopColor="#A8842F" />
                      </linearGradient>
                    </defs>
                    <motion.g
                      animate={{
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {/* Flowing vine pattern */}
                      {pos === 'top-left' && (
                        <>
                          <path d="M5 95 Q5 5 95 5" stroke={`url(#shimmer-${pos})`} strokeWidth="1.5" fill="none" />
                          <path d="M15 85 Q15 15 85 15 M20 70 Q25 65 30 70 Q35 75 40 70 M10 60 Q15 55 20 60" stroke={`url(#shimmer-${pos})`} strokeWidth="1" fill="none" opacity="0.8"/>
                          <circle cx="95" cy="5" r="3" fill={`url(#shimmer-${pos})`} />
                          <circle cx="5" cy="95" r="3" fill={`url(#shimmer-${pos})`} />
                          {/* Small leaves */}
                          <path d="M25 80 Q20 75 25 70" stroke={`url(#shimmer-${pos})`} strokeWidth="0.8" fill="none" />
                          <path d="M35 70 Q30 65 35 60" stroke={`url(#shimmer-${pos})`} strokeWidth="0.8" fill="none" />
                        </>
                      )}
                      {pos === 'top-right' && (
                        <>
                          <path d="M95 95 Q95 5 5 5" stroke={`url(#shimmer-${pos})`} strokeWidth="1.5" fill="none" />
                          <path d="M85 85 Q85 15 15 15 M80 70 Q75 65 70 70 Q65 75 60 70 M90 60 Q85 55 80 60" stroke={`url(#shimmer-${pos})`} strokeWidth="1" fill="none" opacity="0.8"/>
                          <circle cx="5" cy="5" r="3" fill={`url(#shimmer-${pos})`} />
                          <circle cx="95" cy="95" r="3" fill={`url(#shimmer-${pos})`} />
                          <path d="M75 80 Q80 75 75 70" stroke={`url(#shimmer-${pos})`} strokeWidth="0.8" fill="none" />
                          <path d="M65 70 Q70 65 65 60" stroke={`url(#shimmer-${pos})`} strokeWidth="0.8" fill="none" />
                        </>
                      )}
                      {pos === 'bottom-left' && (
                        <>
                          <path d="M5 5 Q5 95 95 95" stroke={`url(#shimmer-${pos})`} strokeWidth="1.5" fill="none" />
                          <path d="M15 15 Q15 85 85 85 M20 30 Q25 35 30 30 Q35 25 40 30 M10 40 Q15 45 20 40" stroke={`url(#shimmer-${pos})`} strokeWidth="1" fill="none" opacity="0.8"/>
                          <circle cx="95" cy="95" r="3" fill={`url(#shimmer-${pos})`} />
                          <circle cx="5" cy="5" r="3" fill={`url(#shimmer-${pos})`} />
                          <path d="M25 20 Q20 25 25 30" stroke={`url(#shimmer-${pos})`} strokeWidth="0.8" fill="none" />
                          <path d="M35 30 Q30 35 35 40" stroke={`url(#shimmer-${pos})`} strokeWidth="0.8" fill="none" />
                        </>
                      )}
                      {pos === 'bottom-right' && (
                        <>
                          <path d="M95 5 Q95 95 5 95" stroke={`url(#shimmer-${pos})`} strokeWidth="1.5" fill="none" />
                          <path d="M85 15 Q85 85 15 85 M80 30 Q75 35 70 30 Q65 25 60 30 M90 40 Q85 45 80 40" stroke={`url(#shimmer-${pos})`} strokeWidth="1" fill="none" opacity="0.8"/>
                          <circle cx="5" cy="95" r="3" fill={`url(#shimmer-${pos})`} />
                          <circle cx="95" cy="5" r="3" fill={`url(#shimmer-${pos})`} />
                          <path d="M75 20 Q80 25 75 30" stroke={`url(#shimmer-${pos})`} strokeWidth="0.8" fill="none" />
                          <path d="M65 30 Q70 35 65 40" stroke={`url(#shimmer-${pos})`} strokeWidth="0.8" fill="none" />
                        </>
                      )}
                    </motion.g>
                  </motion.svg>
                ))}

                {/* Flowing vine border on all sides */}
                {/* Top border */}
                <motion.svg className="absolute top-0 left-1/2" style={{ transform: 'translateX(-50%)', width: '60%', height: 'clamp(30px, 6vh, 50px)', filter: 'drop-shadow(0 0 8px rgba(212,168,83,0.9)) drop-shadow(0 0 16px rgba(245,230,200,0.5))' }} viewBox="0 0 300 30" fill="none" animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                  <defs>
                    <linearGradient id="vine-top" x1="0%" y1="0%" x2="100%" y2="0%">
                      <motion.stop offset="0%" stopColor="#A8842F" animate={{ stopColor: ['#A8842F', '#D4B870', '#F5E6C8', '#D4B870', '#A8842F'] }} transition={{ duration: 4, repeat: Infinity }} />
                      <motion.stop offset="50%" stopColor="#F5E6C8" animate={{ stopColor: ['#F5E6C8', '#D4B870', '#A8842F', '#D4B870', '#F5E6C8'] }} transition={{ duration: 4, repeat: Infinity }} />
                      <motion.stop offset="100%" stopColor="#A8842F" animate={{ stopColor: ['#A8842F', '#D4B870', '#F5E6C8', '#D4B870', '#A8842F'] }} transition={{ duration: 4, repeat: Infinity }} />
                    </linearGradient>
                  </defs>
                  <path d="M10 15 Q50 10 90 15 Q130 20 170 15 Q210 10 250 15 Q270 17 290 15" stroke="url(#vine-top)" strokeWidth="1.5" fill="none" />
                  {[30, 90, 150, 210, 270].map((x, i) => (
                    <g key={i}>
                      <circle cx={x} cy="15" r="2" fill="url(#vine-top)" />
                      <path d={`M${x} 15 Q${x-5} 10 ${x} 5`} stroke="url(#vine-top)" strokeWidth="0.8" fill="none" opacity="0.7" />
                      <path d={`M${x} 15 Q${x+5} 10 ${x} 5`} stroke="url(#vine-top)" strokeWidth="0.8" fill="none" opacity="0.7" />
                    </g>
                  ))}
                </motion.svg>

                {/* Bottom border */}
                <motion.svg className="absolute bottom-0 left-1/2" style={{ transform: 'translateX(-50%)', width: '60%', height: 'clamp(30px, 6vh, 50px)', filter: 'drop-shadow(0 0 8px rgba(212,168,83,0.9)) drop-shadow(0 0 16px rgba(245,230,200,0.5))' }} viewBox="0 0 300 30" fill="none" animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
                  <defs>
                    <linearGradient id="vine-bottom" x1="0%" y1="0%" x2="100%" y2="0%">
                      <motion.stop offset="0%" stopColor="#D4B870" animate={{ stopColor: ['#D4B870', '#F5E6C8', '#D4B870', '#A8842F', '#D4B870'] }} transition={{ duration: 4, repeat: Infinity }} />
                      <motion.stop offset="50%" stopColor="#A8842F" animate={{ stopColor: ['#A8842F', '#D4B870', '#F5E6C8', '#D4B870', '#A8842F'] }} transition={{ duration: 4, repeat: Infinity }} />
                      <motion.stop offset="100%" stopColor="#D4B870" animate={{ stopColor: ['#D4B870', '#F5E6C8', '#D4B870', '#A8842F', '#D4B870'] }} transition={{ duration: 4, repeat: Infinity }} />
                    </linearGradient>
                  </defs>
                  <path d="M10 15 Q50 20 90 15 Q130 10 170 15 Q210 20 250 15 Q270 13 290 15" stroke="url(#vine-bottom)" strokeWidth="1.5" fill="none" />
                  {[30, 90, 150, 210, 270].map((x, i) => (
                    <g key={i}>
                      <circle cx={x} cy="15" r="2" fill="url(#vine-bottom)" />
                      <path d={`M${x} 15 Q${x-5} 20 ${x} 25`} stroke="url(#vine-bottom)" strokeWidth="0.8" fill="none" opacity="0.7" />
                      <path d={`M${x} 15 Q${x+5} 20 ${x} 25`} stroke="url(#vine-bottom)" strokeWidth="0.8" fill="none" opacity="0.7" />
                    </g>
                  ))}
                </motion.svg>
              </div>

              {/* Card content - centered message */}
              <div className="relative h-full flex flex-col items-center justify-center" style={{ padding: 'clamp(20px, 5vh, 40px) clamp(30px, 7vw, 50px)' }}>
                <motion.div
                  className="text-center space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: isFlipped ? 1 : 0,
                    y: isFlipped ? 0 : 20
                  }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <p className="font-serif text-charcoal/80 italic" style={{ fontSize: 'clamp(18px, 4vw, 28px)', lineHeight: '1.6' }}>
                    Dear {guestName || 'Friend'},
                  </p>

                  <p className="font-serif text-charcoal/70" style={{ fontSize: 'clamp(14px, 3vw, 20px)', lineHeight: '1.8' }}>
                    {displayMessage}
                  </p>

                  <p className="font-serif text-charcoal/70" style={{ fontSize: 'clamp(14px, 3vw, 20px)', lineHeight: '1.8', marginTop: 'clamp(16px, 3vh, 24px)' }}>
                    See you in Barcelona! 🥂
                  </p>

                  <p className="font-serif text-charcoal/80 italic" style={{ fontSize: 'clamp(16px, 3.5vw, 24px)', marginTop: 'clamp(20px, 4vh, 40px)' }}>
                    Be Happy,<br />
                    Shriya and Neil
                  </p>
                </motion.div>
              </div>

              {/* Bottom gold accent line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px]"
                style={{
                  background: 'linear-gradient(90deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.6) 50%, rgba(212,168,83,0.2) 100%)',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Flip button - wraps around right edge of card on all screen sizes */}
        <motion.button
          onClick={() => setIsFlipped(!isFlipped)}
          className="absolute flex flex-col items-center gap-2 cursor-pointer group"
          style={{
            right: '-3px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 100,
            padding: '12px 6px',
            background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.15) 0%, rgba(212, 168, 83, 0.25) 100%)',
            borderRadius: '8px 0 0 8px',
            border: '1px solid rgba(212, 168, 83, 0.3)',
            borderRight: 'none',
            backdropFilter: 'blur(4px)',
          }}
          initial={{ opacity: 0, x: 10 }}
          animate={{
            opacity: isVisible && emergenceProgress >= 1 ? 1 : 0,
            x: isVisible && emergenceProgress >= 1 ? 0 : 10,
          }}
          transition={{ delay: 1.3, duration: 0.6 }}
          whileHover={{
            x: -2,
            background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.25) 0%, rgba(212, 168, 83, 0.35) 100%)',
          }}
        >
          {/* Top text */}
          <p
            className="font-sans text-charcoal/70 uppercase tracking-wider"
            style={{
              fontSize: '9px',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              letterSpacing: '0.15em',
              lineHeight: '1.2',
            }}
          >
            {isFlipped ? 'return' : 'click to flip'}
          </p>

          {/* Icon with pulse */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-golden"
            >
              {isFlipped ? (
                // Left arrow for return
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                // Heart icon for personalized message
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  fill="currentColor"
                />
              )}
            </svg>
          </motion.div>

          {/* Bottom text */}
          <p
            className="font-sans text-charcoal/70 uppercase tracking-wider"
            style={{
              fontSize: '9px',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              letterSpacing: '0.15em',
              lineHeight: '1.2',
            }}
          >
            {isFlipped ? 'to invite' : 'for message'}
          </p>
        </motion.button>
      </div>
    </motion.div>
  );
}
