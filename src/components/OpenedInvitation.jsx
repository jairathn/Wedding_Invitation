import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { RSVPButton } from './RSVPButton';

const panelVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export function OpenedInvitation({ guestName }) {
  return (
    <motion.div
      className="w-full min-h-screen flex items-center justify-center py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Three-panel trifold container */}
      <div className="w-full max-w-6xl">
        {/* Decorative outer frame */}
        <div className="relative">
          <div className="absolute -inset-3 border border-golden/20 hidden lg:block" />
          <div className="absolute -inset-1.5 border border-golden/10 hidden lg:block" />

          {/* Main trifold */}
          <div
            className="relative grid grid-cols-1 lg:grid-cols-3 shadow-2xl"
            style={{
              background: `
                linear-gradient(135deg, #FFFEF9 0%, #F5F0E6 25%, #FAF7F2 50%, #F5F0E6 75%, #FFFEF9 100%)
              `,
            }}
          >
            {/* Paper texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-golden/30 via-golden to-golden/30" />

            {/* LEFT PANEL - Welcome & Message */}
            <motion.div
              className="relative p-8 lg:p-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-golden/20"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              {/* Decorative corner */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-golden/30" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-golden/30 lg:hidden" />

              <motion.div
                className="text-center lg:text-left"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
              >
                {/* Welcome */}
                <h2 className="font-serif text-2xl md:text-3xl text-charcoal italic font-light mb-2">
                  Welcome,
                </h2>
                <p className="font-serif text-3xl md:text-4xl text-terracotta italic mb-8">
                  {guestName}
                </p>

                {/* Divider */}
                <div className="flex items-center justify-center lg:justify-start mb-8">
                  <div className="h-px w-8 bg-golden/50" />
                  <svg width="16" height="16" viewBox="0 0 16 16" className="mx-3 text-golden">
                    <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" fill="currentColor" opacity="0.5" />
                  </svg>
                  <div className="h-px w-8 bg-golden/50" />
                </div>

                {/* Message */}
                <div className="space-y-4">
                  <p className="font-serif text-xl md:text-2xl text-charcoal italic leading-relaxed">
                    Shriya & Neil
                  </p>
                  <p className="font-sans text-sm text-charcoal-light tracking-wide leading-relaxed">
                    joyfully request the pleasure of
                    <br />
                    your company at their wedding celebration
                  </p>
                </div>

                {/* Bottom flourish */}
                <motion.div
                  className="mt-8 flex justify-center lg:justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <svg width="80" height="20" viewBox="0 0 80 20" className="text-golden opacity-50">
                    <path d="M0 10 Q20 0, 40 10 T80 10" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* CENTER PANEL - Video */}
            <motion.div
              className="relative p-6 lg:p-8 flex flex-col justify-center items-center border-b lg:border-b-0"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="w-full max-w-md"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.6 }}
              >
                {/* Video label */}
                <p className="font-sans text-xs text-charcoal-light tracking-[0.2em] uppercase text-center mb-4">
                  Our Story
                </p>

                {/* Video Player */}
                <VideoPlayer />

                {/* Video caption */}
                <p className="font-serif text-sm text-charcoal-light italic text-center mt-4 opacity-70">
                  Click to play
                </p>
              </motion.div>
            </motion.div>

            {/* RIGHT PANEL - Details & RSVP */}
            <motion.div
              className="relative p-8 lg:p-10 flex flex-col justify-center lg:border-l border-golden/20"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
            >
              {/* Decorative corner */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-golden/30 hidden lg:block" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-golden/30 hidden lg:block" />

              <motion.div
                className="text-center lg:text-right"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.8 }}
              >
                {/* Hashtag */}
                <p className="font-serif text-2xl md:text-3xl text-golden italic tracking-wide mb-6">
                  #JayWalkingToJairath
                </p>

                {/* Divider */}
                <div className="flex items-center justify-center lg:justify-end mb-6">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-golden/50" />
                </div>

                {/* Location */}
                <div className="mb-8">
                  <p className="font-sans text-xs text-charcoal-light tracking-[0.25em] uppercase mb-2">
                    Barcelona, Spain
                  </p>
                  <p className="font-serif text-xl md:text-2xl text-charcoal italic">
                    September 9 – 11, 2026
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center lg:justify-end mb-8">
                  <svg width="20" height="20" viewBox="0 0 20 20" className="text-golden">
                    <path d="M10 0 L11 9 L20 10 L11 11 L10 20 L9 11 L0 10 L9 9 Z" fill="currentColor" opacity="0.4" />
                  </svg>
                </div>

                {/* RSVP Button */}
                <div className="flex justify-center lg:justify-end">
                  <RSVPButton />
                </div>
              </motion.div>
            </motion.div>

            {/* Bottom border */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-golden/30 via-golden to-golden/30" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
