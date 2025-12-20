import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuestValidation } from '../hooks/useGuestValidation';

export function NameEntryModal({ isOpen, onValidName }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { validateGuest } = useGuestValidation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const { valid, matchedName } = validateGuest(name);

    if (valid) {
      onValidName(matchedName);
    } else {
      setError("We couldn't find that name. Please enter your name exactly as it appears on your invitation.");
      setIsValidating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-warm-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Decorative top border */}
            <div className="h-1 bg-gradient-to-r from-terracotta via-golden to-terracotta" />

            <div className="px-6 py-8 md:px-10 md:py-10">
              {/* Title */}
              <motion.h2
                className="font-serif text-2xl md:text-3xl text-charcoal text-center italic font-light mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Welcome
              </motion.h2>

              <motion.p
                className="text-charcoal-light text-center text-sm md:text-base mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Please enter your name as it appears on your invitation
              </motion.p>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-cream-dark rounded-sm font-sans text-charcoal placeholder-charcoal-light/50 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors bg-cream/30"
                    autoFocus
                  />
                </motion.div>

                {/* Error message */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.p
                      className="mt-3 text-terracotta text-sm text-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={isValidating || !name.trim()}
                  className="w-full mt-6 px-6 py-3 bg-terracotta text-warm-white font-sans font-medium tracking-widest text-sm uppercase rounded-sm transition-all duration-300 hover:bg-terracotta-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: isValidating ? 1 : 1.01 }}
                  whileTap={{ scale: isValidating ? 1 : 0.99 }}
                >
                  {isValidating ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-warm-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Continue'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
