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
        className="px-14 py-5 bg-terracotta text-warm-white rounded-sm transition-all duration-300 group-hover:bg-terracotta/90 group-hover:shadow-xl"
        style={{
          boxShadow: '0 4px 16px rgba(196, 114, 94, 0.3), 0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <p className="font-serif text-xl italic tracking-wide mb-1">
          RSVP
        </p>
        <p className="font-sans text-[11px] text-warm-white/80 tracking-wider">
          Password: Barcelona2026
        </p>
      </div>
    </motion.a>
  );
}
