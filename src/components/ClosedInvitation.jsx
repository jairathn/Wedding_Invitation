import { motion } from 'framer-motion';
import { Monogram } from './Monogram';

export function ClosedInvitation({ onOpen }) {
  return (
    <motion.div
      className="relative w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Invitation Card */}
      <div className="bg-warm-white rounded-lg shadow-2xl overflow-hidden border border-cream-dark">
        {/* Decorative top border */}
        <div className="h-2 bg-gradient-to-r from-terracotta via-golden to-terracotta" />

        <div className="px-6 py-8 md:px-10 md:py-12 flex flex-col items-center text-center">
          {/* Monogram */}
          <Monogram />

          {/* Decorative divider */}
          <motion.div
            className="w-24 h-px bg-gradient-to-r from-transparent via-golden to-transparent my-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          {/* Names */}
          <motion.h1
            className="font-serif text-3xl md:text-4xl text-charcoal italic font-light tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Shriya & Neil
          </motion.h1>

          {/* Engagement Photo */}
          <motion.div
            className="mt-8 w-full aspect-[4/5] rounded-lg overflow-hidden shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <img
              src="/images/engagement-photo.jpg"
              alt="Shriya and Neil"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Decorative divider */}
          <motion.div
            className="w-16 h-px bg-gradient-to-r from-transparent via-terracotta to-transparent my-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          />

          {/* Open Invitation Button */}
          <motion.button
            onClick={onOpen}
            className="group relative px-8 py-4 bg-terracotta text-warm-white font-sans font-medium tracking-widest text-sm uppercase rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">Open Invitation</span>
            <motion.div
              className="absolute inset-0 bg-terracotta-dark"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </div>

        {/* Decorative bottom border */}
        <div className="h-2 bg-gradient-to-r from-terracotta via-golden to-terracotta" />
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-golden/30 rounded-tl-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      />
      <motion.div
        className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-golden/30 rounded-br-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      />
    </motion.div>
  );
}
