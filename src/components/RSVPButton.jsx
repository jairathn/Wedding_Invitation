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
          paddingLeft: 'clamp(32px, 14vw, 90px)',
          paddingRight: 'clamp(32px, 14vw, 90px)',
          paddingTop: 'clamp(4px, 0.8vh, 7px)',
          paddingBottom: 'clamp(4px, 0.8vh, 7px)',
          boxShadow: '0 6px 24px rgba(196, 114, 94, 0.45), 0 4px 12px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        <p
          className="font-serif font-bold italic tracking-wide whitespace-nowrap"
          style={{
            fontSize: 'clamp(16px, 4vw, 26px)',
            marginBottom: 'clamp(2px, 0.5vh, 4px)'
          }}
        >
          Click to RSVP
        </p>
        <p
          className="font-sans text-warm-white tracking-normal font-bold whitespace-nowrap shimmer-text"
          style={{
            fontSize: 'clamp(11px, 2.5vw, 15px)'
          }}
        >
          Password: Barcelona2026
        </p>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 1) 25%,
            rgba(255, 245, 220, 1) 50%,
            rgba(255, 255, 255, 1) 75%,
            rgba(255, 255, 255, 0.9) 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </motion.a>
  );
}
