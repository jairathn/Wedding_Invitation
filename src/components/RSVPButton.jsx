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
        className="bg-terracotta text-warm-white rounded-sm transition-all duration-300 group-hover:bg-terracotta/90 group-hover:shadow-2xl"
        style={{
          paddingLeft: 'clamp(48px, 12vw, 152px)',
          paddingRight: 'clamp(48px, 12vw, 152px)',
          paddingTop: 'clamp(32px, 6.9vh, 48px)',
          paddingBottom: 'clamp(40px, 9.1vh, 64px)',
          boxShadow: '0 6px 24px rgba(196, 114, 94, 0.45), 0 4px 12px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        <p
          className="font-serif font-bold italic tracking-wide whitespace-nowrap"
          style={{
            fontSize: 'clamp(36px, 6.9vh, 48px)',
            marginBottom: 'clamp(6px, 1.1vh, 8px)',
          }}
        >
          Click to RSVP
        </p>
        <p
          className="font-sans text-warm-white/85 tracking-normal font-medium"
          style={{
            fontSize: 'clamp(13px, 2.0vh, 14px)',
          }}
        >
          Password: Barcelona2026
        </p>
      </div>
    </motion.a>
  );
}
