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
        {/* Decorative frame - rounded */}
        <div className="absolute -inset-1 border border-golden/30 rounded-md transition-all duration-300 group-hover:border-golden/50" />

        {/* Button content - rounded */}
        <div className="relative px-6 py-4 bg-terracotta text-warm-white rounded-md transition-all duration-500 group-hover:bg-terracotta-dark group-hover:shadow-lg">
          <p className="font-serif text-sm italic tracking-wide mb-0.5">
            RSVP at Zola
          </p>
          <p className="font-sans text-xs text-warm-white/80 tracking-wider">
            Password: <span className="text-golden-light font-medium">Barcelona2026</span>
          </p>

          {/* Corner accents - rounded */}
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-golden-light/40 rounded-tl-sm transition-all duration-300 group-hover:border-golden-light/70" />
          <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-golden-light/40 rounded-tr-sm transition-all duration-300 group-hover:border-golden-light/70" />
          <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-golden-light/40 rounded-bl-sm transition-all duration-300 group-hover:border-golden-light/70" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-golden-light/40 rounded-br-sm transition-all duration-300 group-hover:border-golden-light/70" />
        </div>
      </div>
    </motion.a>
  );
}
