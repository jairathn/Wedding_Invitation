import { motion } from 'framer-motion';

export function RSVPButton() {
  return (
    <motion.a
      href="https://www.zola.com/wedding/neilandshriya2026"
      target="_blank"
      rel="noopener noreferrer"
      className="group block text-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className="bg-terracotta text-warm-white rounded-sm transition-all duration-300 group-hover:bg-terracotta/90 group-hover:shadow-2xl w-full"
        style={{
          paddingLeft: 'clamp(40px, 18vw, 110px)',
          paddingRight: 'clamp(40px, 18vw, 110px)',
          paddingTop: 'clamp(5px, 1.375vh, 6px)',
          paddingBottom: 'clamp(6.5px, 1.75vh, 10px)',
          boxShadow: '0 6px 24px rgba(196, 114, 94, 0.45), 0 4px 12px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        <p
          className="font-serif font-bold italic tracking-wide whitespace-nowrap"
          style={{
            fontSize: 'clamp(30px, 8vw, 44px)',
            marginBottom: 'clamp(1px, 0.25vh, 1.5px)'
          }}
        >
          Click to RSVP
        </p>
        <p
          className="font-sans text-warm-white/85 tracking-normal font-medium whitespace-nowrap"
          style={{
            fontSize: 'clamp(11px, 2.3vw, 13px)'
          }}
        >
          Password: Barcelona2026
        </p>
      </div>
    </motion.a>
  );
}
