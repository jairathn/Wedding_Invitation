import { motion } from 'framer-motion';

export function RSVPButton() {
  return (
    <motion.a
      href="https://www.zola.com/wedding/neilandshriya2026"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block w-full max-w-sm"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="bg-gradient-to-r from-terracotta to-terracotta-dark text-warm-white rounded-sm shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        <div className="px-6 py-4 md:px-8 md:py-5 text-center">
          <p className="font-sans font-medium tracking-widest text-sm uppercase mb-1">
            Click to RSVP at Zola!
          </p>
          <p className="font-sans text-xs text-warm-white/80 tracking-wide">
            Our password is <span className="font-medium text-golden-light">Barcelona2026</span>
          </p>
        </div>
      </div>
    </motion.a>
  );
}
