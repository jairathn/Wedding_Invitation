import { motion } from 'framer-motion';
import { PaperTexture } from './PaperTexture';

export function ClosedInvitation({ onOpen }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Main card with rounded corners */}
        <div className="relative">
          {/* Outer decorative border - slightly rounded */}
          <div className="absolute -inset-3 border border-golden/25 rounded-lg" />

          {/* Card with paper texture */}
          <div className="relative overflow-hidden rounded-md shadow-2xl">
            {/* Paper texture background */}
            <PaperTexture />

            {/* Top gold line */}
            <div className="relative h-px bg-gradient-to-r from-transparent via-golden/70 to-transparent" />

            {/* Content */}
            <div className="relative px-12 py-12 md:px-16 md:py-14">

              {/* Names */}
              <motion.div
                className="text-center mb-8"
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
                className="flex items-center justify-center mb-8"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-golden/50" />
                <div className="mx-4 text-golden text-lg">✦</div>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-golden/50" />
              </motion.div>

              {/* Engagement Photo - with rounded corners and elegant frame */}
              <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="relative">
                  {/* Photo frame - rounded */}
                  <div className="absolute -inset-3 border border-golden/20 rounded-md" />
                  <div className="absolute -inset-1.5 border border-golden/10 rounded-sm" />

                  {/* Photo - slightly rounded corners */}
                  <div className="relative w-64 md:w-72 aspect-[4/5] overflow-hidden rounded-sm">
                    <img
                      src="/images/engagement-photo.jpg"
                      alt="Shriya and Neil"
                      className="w-full h-full object-cover"
                    />
                    {/* Vignette overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow: 'inset 0 0 50px rgba(44,44,44,0.15)',
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Divider */}
              <motion.div
                className="flex items-center justify-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-golden/40" />
                <div className="mx-3 text-golden text-sm">◆</div>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-golden/40" />
              </motion.div>

              {/* Open Invitation Button - rounded */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <button
                  onClick={onOpen}
                  className="group relative px-10 py-3.5 border-2 border-terracotta text-terracotta font-serif text-lg italic tracking-wide rounded-md transition-all duration-300 hover:bg-terracotta hover:text-warm-white"
                >
                  Open Invitation

                  {/* Corner accents - adjusted for rounded corners */}
                  <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-golden rounded-tl-sm" />
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-golden rounded-tr-sm" />
                  <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-golden rounded-bl-sm" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-golden rounded-br-sm" />
                </button>
              </motion.div>
            </div>

            {/* Bottom gold line */}
            <div className="relative h-px bg-gradient-to-r from-transparent via-golden/70 to-transparent" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
