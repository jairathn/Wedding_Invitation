import { motion } from 'framer-motion';

export function ClosedInvitation({ onOpen }) {
  return (
    <motion.div
      className="relative w-full max-w-lg mx-auto px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      {/* Main Invitation Card */}
      <div className="relative">
        {/* Outer decorative border */}
        <div className="absolute -inset-3 border border-golden/30 rounded-sm" />
        <div className="absolute -inset-1.5 border border-golden/20 rounded-sm" />

        {/* Card body */}
        <div
          className="relative bg-warm-white shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #FFFEF9 0%, #FAF7F2 50%, #FFFEF9 100%)',
          }}
        >
          {/* Top ornamental border */}
          <div className="h-1 bg-gradient-to-r from-golden/40 via-golden to-golden/40" />

          {/* Inner content with generous padding */}
          <div className="px-8 pt-12 pb-10 md:px-12 md:pt-16 md:pb-14">

            {/* Ornate header decoration */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <svg width="120" height="20" viewBox="0 0 120 20" className="text-golden">
                <path
                  d="M0 10 Q15 0, 30 10 T60 10 T90 10 T120 10"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.6"
                />
                <circle cx="60" cy="10" r="3" fill="currentColor" opacity="0.4" />
                <circle cx="30" cy="10" r="2" fill="currentColor" opacity="0.3" />
                <circle cx="90" cy="10" r="2" fill="currentColor" opacity="0.3" />
              </svg>
            </motion.div>

            {/* Monogram with ornate frame */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="relative">
                {/* Ornate circular frame */}
                <svg width="140" height="140" viewBox="0 0 140 140" className="absolute -inset-2">
                  <defs>
                    <linearGradient id="sealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D4A853" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#C4725E" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#D4A853" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <circle cx="70" cy="70" r="65" stroke="url(#sealGradient)" strokeWidth="1" fill="none" />
                  <circle cx="70" cy="70" r="58" stroke="url(#sealGradient)" strokeWidth="0.5" fill="none" opacity="0.5" />
                  {/* Decorative notches */}
                  {[...Array(12)].map((_, i) => (
                    <line
                      key={i}
                      x1={70 + 55 * Math.cos((i * 30 * Math.PI) / 180)}
                      y1={70 + 55 * Math.sin((i * 30 * Math.PI) / 180)}
                      x2={70 + 62 * Math.cos((i * 30 * Math.PI) / 180)}
                      y2={70 + 62 * Math.sin((i * 30 * Math.PI) / 180)}
                      stroke="#D4A853"
                      strokeWidth="1"
                      opacity="0.4"
                    />
                  ))}
                </svg>

                {/* Monogram text */}
                <div className="w-32 h-32 flex items-center justify-center">
                  <span className="font-serif text-5xl md:text-6xl tracking-wider">
                    <span className="text-terracotta italic font-light">S</span>
                    <span className="text-golden mx-1 text-4xl">&</span>
                    <span className="text-terracotta italic font-light">N</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Names */}
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="font-serif text-3xl md:text-4xl text-charcoal italic font-light tracking-wide leading-relaxed">
                Shriya & Neil
              </h1>
              <p className="font-sans text-xs text-charcoal-light tracking-[0.3em] uppercase mt-3">
                Request Your Presence
              </p>
            </motion.div>

            {/* Engagement Photo with vignette */}
            <motion.div
              className="relative mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {/* Photo frame decoration */}
              <div className="absolute -inset-2 border border-golden/30" />
              <div className="absolute -inset-1 border border-golden/20" />

              {/* Photo container with vignette */}
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
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(44,44,44,0.15) 100%)',
                  }}
                />
                {/* Soft edge fade */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 0 30px rgba(250,247,242,0.5)',
                  }}
                />
              </div>
            </motion.div>

            {/* Decorative divider */}
            <motion.div
              className="flex items-center justify-center mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-golden/60" />
              <div className="mx-4">
                <svg width="20" height="20" viewBox="0 0 20 20" className="text-golden">
                  <path
                    d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z"
                    fill="currentColor"
                    opacity="0.6"
                  />
                </svg>
              </div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-golden/60" />
            </motion.div>

            {/* Open Invitation Button */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <button
                onClick={onOpen}
                className="group relative px-10 py-4 border-2 border-terracotta text-terracotta font-serif text-lg italic tracking-wide transition-all duration-500 hover:bg-terracotta hover:text-warm-white hover:shadow-lg"
              >
                <span className="relative z-10">Open Invitation</span>

                {/* Corner decorations */}
                <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-golden transition-all duration-300 group-hover:w-4 group-hover:h-4" />
                <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-golden transition-all duration-300 group-hover:w-4 group-hover:h-4" />
                <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-golden transition-all duration-300 group-hover:w-4 group-hover:h-4" />
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-golden transition-all duration-300 group-hover:w-4 group-hover:h-4" />
              </button>
            </motion.div>
          </div>

          {/* Bottom ornamental border */}
          <div className="h-1 bg-gradient-to-r from-golden/40 via-golden to-golden/40" />
        </div>
      </div>

      {/* Wax Seal */}
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, scale: 0, rotate: -20 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 1, duration: 0.6, type: 'spring', stiffness: 200 }}
      >
        <div className="relative">
          {/* Seal shadow */}
          <div className="absolute inset-0 bg-terracotta-dark/30 rounded-full blur-md translate-y-1" />

          {/* Main seal */}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #D4725E 0%, #C4725E 40%, #A85D4A 100%)',
              boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {/* Seal texture */}
            <div
              className="absolute inset-1 rounded-full border border-warm-white/20"
              style={{
                background: 'radial-gradient(circle at 40% 40%, transparent 0%, rgba(0,0,0,0.1) 100%)',
              }}
            />

            {/* Seal content */}
            <div className="relative text-warm-white font-serif text-xl tracking-wider">
              <span className="italic">S</span>
              <span className="text-golden-light mx-0.5 text-sm">&</span>
              <span className="italic">N</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
