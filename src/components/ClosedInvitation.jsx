import { motion } from 'framer-motion';

export function ClosedInvitation({ onOpen }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Outer decorative border */}
        <div className="relative">
          <div className="absolute -inset-3 border border-golden/30" />

          {/* Main card */}
          <div
            className="relative shadow-2xl"
            style={{
              background: 'linear-gradient(145deg, #FFFEF9 0%, #FAF7F2 100%)',
            }}
          >
            {/* Top gold line */}
            <div className="h-px bg-gradient-to-r from-transparent via-golden to-transparent" />

            {/* Content */}
            <div className="px-16 py-14 md:px-20 md:py-16">

              {/* Names */}
              <motion.div
                className="text-center mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h1 className="font-serif text-4xl md:text-5xl text-charcoal italic font-light tracking-wide mb-3">
                  Shriya & Neil
                </h1>
                <p className="font-sans text-xs text-charcoal-light tracking-[0.3em] uppercase">
                  Request Your Presence
                </p>
              </motion.div>

              {/* Divider */}
              <motion.div
                className="flex items-center justify-center mb-10"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-golden/60" />
                <div className="mx-4 text-golden">✦</div>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-golden/60" />
              </motion.div>

              {/* Engagement Photo - smaller with more breathing room */}
              <motion.div
                className="flex justify-center mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="relative w-72 md:w-80">
                  {/* Photo frame */}
                  <div className="absolute -inset-3 border border-golden/20" />
                  <div className="absolute -inset-1.5 border border-golden/10" />

                  {/* Photo */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src="/images/engagement-photo.jpg"
                      alt="Shriya and Neil"
                      className="w-full h-full object-cover"
                    />
                    {/* Vignette overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow: 'inset 0 0 40px rgba(44,44,44,0.2)',
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Divider */}
              <motion.div
                className="flex items-center justify-center mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-golden/40" />
                <div className="mx-3 text-golden text-sm">◆</div>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-golden/40" />
              </motion.div>

              {/* Open Invitation Button */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <button
                  onClick={onOpen}
                  className="group relative px-12 py-4 border-2 border-terracotta text-terracotta font-serif text-lg italic tracking-wide transition-all duration-300 hover:bg-terracotta hover:text-warm-white"
                >
                  Open Invitation

                  {/* Corner accents */}
                  <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-golden" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-golden" />
                  <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-golden" />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-golden" />
                </button>
              </motion.div>
            </div>

            {/* Bottom gold line */}
            <div className="h-px bg-gradient-to-r from-transparent via-golden to-transparent" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
