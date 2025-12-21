import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { RSVPButton } from './RSVPButton';
import { PaperTexture } from './PaperTexture';

export function OpenedInvitation({ guestName, isAnimating = false }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8" style={{ perspective: '2000px' }}>
      <motion.div
        className="w-full max-w-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Connected Trifold Container */}
        <div
          className="relative flex justify-center items-stretch"
          style={{
            minHeight: '75vh',
            maxHeight: '85vh',
          }}
        >
          {/* LEFT PANEL - with perspective fold */}
          <motion.div
            className="relative origin-right"
            style={{
              width: '220px',
              flexShrink: 0,
              transformStyle: 'preserve-3d',
            }}
            initial={isAnimating ? { rotateY: -90 } : { rotateY: 0, opacity: 1 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <div
              className="h-full relative overflow-hidden"
              style={{
                // Trapezoid - shorter on right (toward center)
                clipPath: 'polygon(0 0, 100% 3%, 100% 97%, 0 100%)',
                transform: 'translateX(2px)', // Close gap with center
              }}
            >
              {/* Paper texture */}
              <PaperTexture />

              {/* Fold shadow on right edge */}
              <div
                className="absolute top-0 right-0 w-8 h-full z-10"
                style={{
                  background: 'linear-gradient(to left, rgba(0,0,0,0.15), transparent)',
                }}
              />

              {/* Content - vertically distributed with safe padding */}
              <div className="relative h-full flex flex-col justify-between py-16 pl-6 pr-10">
                {/* Top section - Welcome */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <p className="font-serif text-lg md:text-xl text-charcoal/80 italic mb-1">
                    Welcome,
                  </p>
                  <p className="font-serif text-xl md:text-2xl text-terracotta italic leading-tight">
                    {guestName}
                  </p>
                </motion.div>

                {/* Middle section - Invitation text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="py-4"
                >
                  {/* Decorative line */}
                  <div className="w-12 h-px bg-golden/50 mb-5" />

                  <p className="font-serif text-lg md:text-xl text-charcoal italic mb-3 leading-tight">
                    Shriya & Neil
                  </p>
                  <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                    joyfully request the<br />
                    pleasure of your<br />
                    company at their<br />
                    wedding celebration
                  </p>
                </motion.div>

                {/* Bottom section - decorative */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="w-8 h-px bg-golden/30" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* CENTER PANEL - Rectangle */}
          <motion.div
            className="relative z-10"
            style={{
              width: '400px',
              maxWidth: '45%',
              flexShrink: 0,
            }}
            initial={isAnimating ? { scale: 0.95, opacity: 0 } : { scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="h-full relative overflow-hidden shadow-lg">
              {/* Paper texture */}
              <PaperTexture />

              {/* Top gold accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-golden/30 via-golden/60 to-golden/30" />

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center px-6 py-10 md:px-10 md:py-14">
                <motion.div
                  className="w-full max-w-xs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {/* Video label */}
                  <p className="font-sans text-xs text-charcoal/60 tracking-[0.2em] uppercase text-center mb-4">
                    Our Story
                  </p>

                  {/* Video Player with elegant frame */}
                  <div className="relative">
                    <div className="absolute -inset-2 border border-golden/30 rounded-md" />
                    <div className="rounded-sm overflow-hidden shadow-md">
                      <VideoPlayer />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom gold accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-golden/30 via-golden/60 to-golden/30" />
            </div>
          </motion.div>

          {/* RIGHT PANEL - with perspective fold */}
          <motion.div
            className="relative origin-left"
            style={{
              width: '220px',
              flexShrink: 0,
              transformStyle: 'preserve-3d',
            }}
            initial={isAnimating ? { rotateY: 90 } : { rotateY: 0, opacity: 1 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <div
              className="h-full relative overflow-hidden"
              style={{
                // Trapezoid - shorter on left (toward center)
                clipPath: 'polygon(0 3%, 100% 0, 100% 100%, 0 97%)',
                transform: 'translateX(-2px)', // Close gap with center
              }}
            >
              {/* Paper texture */}
              <PaperTexture />

              {/* Fold shadow on left edge */}
              <div
                className="absolute top-0 left-0 w-8 h-full z-10"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.15), transparent)',
                }}
              />

              {/* Content - vertically distributed with safe padding */}
              <div className="relative h-full flex flex-col justify-between py-16 pl-10 pr-6 text-right">
                {/* Top section - Hashtag */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <p className="font-serif text-lg md:text-xl text-golden italic leading-tight">
                    #JayWalkingToJairath
                  </p>
                </motion.div>

                {/* Middle section - Date/Location */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="py-4"
                >
                  {/* Decorative line */}
                  <div className="w-12 h-px bg-golden/50 mb-5 ml-auto" />

                  <p className="font-sans text-xs text-charcoal/60 tracking-[0.15em] uppercase mb-2">
                    Barcelona, Spain
                  </p>
                  <p className="font-serif text-lg md:text-xl text-charcoal italic leading-tight">
                    September 9 – 11, 2026
                  </p>
                </motion.div>

                {/* Bottom section - RSVP */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  {/* Decorative line */}
                  <div className="w-8 h-px bg-golden/30 mb-4 ml-auto" />

                  <div className="flex justify-end">
                    <RSVPButton />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Shadow underneath the trifold */}
        <div
          className="mx-auto mt-4"
          style={{
            width: '60%',
            height: '20px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, transparent 70%)',
          }}
        />
      </motion.div>
    </div>
  );
}
