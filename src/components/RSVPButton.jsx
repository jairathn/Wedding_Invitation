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
      <div className="relative">
        {/* Decorative frame */}
        <div className="absolute -inset-1 border border-golden/30 transition-all duration-300 group-hover:border-golden/50" />

        {/* Button content */}
        <div className="relative px-8 py-5 bg-terracotta text-warm-white transition-all duration-500 group-hover:bg-terracotta-dark group-hover:shadow-lg">
          <p className="font-serif text-base italic tracking-wide mb-1">
            RSVP at Zola
          </p>
          <p className="font-sans text-xs text-warm-white/80 tracking-wider">
            Password: <span className="text-golden-light font-medium">Barcelona2026</span>
          </p>

          {/* Corner accents */}
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-golden-light/40 transition-all duration-300 group-hover:w-3 group-hover:h-3 group-hover:border-golden-light/70" />
          <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-golden-light/40 transition-all duration-300 group-hover:w-3 group-hover:h-3 group-hover:border-golden-light/70" />
          <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-golden-light/40 transition-all duration-300 group-hover:w-3 group-hover:h-3 group-hover:border-golden-light/70" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-golden-light/40 transition-all duration-300 group-hover:w-3 group-hover:h-3 group-hover:border-golden-light/70" />
        </div>
      </div>
    </motion.a>
  );
}
