import { motion } from 'framer-motion';

export function RSVPButton() {
  return (
    <motion.a
      href="https://www.zola.com/wedding/neilandshriya2026"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-block text-center"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="px-10 py-4 border border-terracotta/80 text-terracotta rounded-sm transition-all duration-300 group-hover:bg-terracotta group-hover:text-warm-white group-hover:border-terracotta">
        <p className="font-serif text-lg italic tracking-wide mb-1">
          RSVP
        </p>
        <p className="font-sans text-[11px] text-current opacity-60 tracking-wider">
          Password: Barcelona2026
        </p>
      </div>
    </motion.a>
  );
}
