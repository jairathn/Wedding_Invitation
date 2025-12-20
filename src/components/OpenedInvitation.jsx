import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { RSVPButton } from './RSVPButton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export function OpenedInvitation({ guestName }) {
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome message */}
      <motion.div className="text-center mb-8" variants={itemVariants}>
        <h2 className="font-serif text-2xl md:text-3xl text-charcoal italic font-light">
          Welcome, <span className="text-terracotta">{guestName}</span>!
        </h2>
      </motion.div>

      {/* Video Player */}
      <motion.div variants={itemVariants}>
        <VideoPlayer />
      </motion.div>

      {/* Hashtag */}
      <motion.div className="text-center mt-8 mb-6" variants={itemVariants}>
        <p className="font-serif text-2xl md:text-3xl text-golden italic tracking-wide">
          #JayWalkingToJairath
        </p>
      </motion.div>

      {/* Location and Date */}
      <motion.div className="text-center mb-8" variants={itemVariants}>
        <p className="font-sans text-charcoal-light text-sm md:text-base tracking-wider">
          Barcelona, Spain
        </p>
        <p className="font-serif text-charcoal text-lg md:text-xl mt-1 italic">
          September 9 - 11, 2026
        </p>
      </motion.div>

      {/* Decorative divider */}
      <motion.div
        className="flex items-center justify-center mb-8"
        variants={itemVariants}
      >
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-golden/50" />
        <div className="mx-4 text-golden text-xl">✦</div>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-golden/50" />
      </motion.div>

      {/* RSVP Button */}
      <motion.div className="flex justify-center" variants={itemVariants}>
        <RSVPButton />
      </motion.div>

      {/* Footer spacing */}
      <div className="h-12" />
    </motion.div>
  );
}
