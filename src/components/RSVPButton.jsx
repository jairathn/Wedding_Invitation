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
          paddingLeft: 'clamp(36px, 16.2vw, 99px)',
          paddingRight: 'clamp(36px, 16.2vw, 99px)',
          paddingTop: 'clamp(2.7px, 0.7425vh, 5.4px)',
          paddingBottom: 'clamp(4.5px, 1.2114vh, 9px)',
          boxShadow: '0 6px 24px rgba(196, 114, 94, 0.45), 0 4px 12px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        <p
          className="font-serif font-bold italic tracking-wide whitespace-nowrap"
          style={{
            fontSize: 'clamp(27px, 7.2vw, 39.6px)',
            marginBottom: 'clamp(0.9px, 0.225vh, 1.35px)'
          }}
        >
          Click to RSVP
        </p>
        <p
          className="font-sans text-warm-white/85 tracking-normal font-medium whitespace-nowrap"
          style={{
            fontSize: 'clamp(9.9px, 2.07vw, 11.7px)'
          }}
        >
          Password: Barcelona2026
        </p>
      </div>
    </motion.a>
  );
}
