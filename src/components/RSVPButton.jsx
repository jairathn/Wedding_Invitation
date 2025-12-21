import { motion } from 'framer-motion';

export function RSVPButton() {
  return (
    <motion.a
      href="https://www.zola.com/wedding/neilandshriya2026"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-block"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative px-8 py-3 border-2 border-terracotta text-terracotta rounded transition-all duration-300 hover:bg-terracotta hover:text-warm-white">
        <p className="font-serif text-base italic tracking-wide">
          RSVP
        </p>
        <p className="font-sans text-xs text-current opacity-70 tracking-wide mt-0.5">
          Password: Barcelona2026
        </p>
      </div>
    </motion.a>
  );
}
