import { motion } from 'framer-motion';

export function RSVPButton() {
  return (
    <motion.a
      href="https://www.zola.com/wedding/neilandshriya2026"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-block text-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className="bg-terracotta text-warm-white rounded-sm transition-all duration-300 group-hover:bg-terracotta/90 group-hover:shadow-2xl px-8 sm:px-24 md:px-32 lg:px-[152px] py-6 sm:py-10 md:py-12 lg:pt-12 lg:pb-16"
        style={{
          boxShadow: '0 6px 24px rgba(196, 114, 94, 0.45), 0 4px 12px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        <p className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold italic tracking-wide mb-1 sm:mb-2 whitespace-nowrap">
          Click to RSVP
        </p>
        <p className="font-sans text-xs sm:text-sm text-warm-white/85 tracking-normal font-medium">
          Password: Barcelona2026
        </p>
      </div>
    </motion.a>
  );
}
