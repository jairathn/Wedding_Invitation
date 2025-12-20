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

    await new Promise(resolve => setTimeout(resolve, 600));

    const { valid, matchedName } = validateGuest(name);

    if (valid) {
      onValidName(matchedName);
    } else {
      setError("We couldn't find that name. Please try again.");
      setIsValidating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Decorative outer borders */}
            <div className="absolute -inset-2 border border-golden/20" />

            {/* Modal card */}
            <div
              className="relative shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #FFFEF9 0%, #FAF7F2 50%, #FFFEF9 100%)',
              }}
            >
              {/* Top border */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-golden to-transparent" />

              <div className="px-10 py-12 md:px-14 md:py-16">
                {/* Decorative flourish */}
                <motion.div
                  className="flex justify-center mb-8"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <svg width="60" height="30" viewBox="0 0 60 30" className="text-golden">
                    <path
                      d="M0 15 Q15 5, 30 15 T60 15"
                      stroke="currentColor"
                      strokeWidth="1"
                      fill="none"
                      opacity="0.5"
                    />
                    <circle cx="30" cy="15" r="2" fill="currentColor" opacity="0.4" />
                  </svg>
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="font-serif text-3xl md:text-4xl text-charcoal text-center italic font-light mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Welcome
                </motion.h2>

                <motion.p
                  className="text-charcoal-light text-center text-sm tracking-wide mb-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Please enter your name
                </motion.p>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <motion.div
                    className="mb-8"
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
                      className="w-full px-6 py-4 border border-cream-dark bg-warm-white/50 font-serif text-lg text-charcoal placeholder-charcoal-light/40 focus:outline-none focus:border-golden focus:bg-warm-white transition-all duration-300 text-center tracking-wide"
                      autoFocus
                    />
                  </motion.div>

                  {/* Error message */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.p
                        className="mb-6 text-terracotta text-sm text-center italic"
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
                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <button
                      type="submit"
                      disabled={isValidating || !name.trim()}
                      className="group relative px-12 py-4 bg-terracotta text-warm-white font-serif text-lg italic tracking-wide transition-all duration-500 hover:bg-terracotta-dark hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-terracotta disabled:hover:shadow-none"
                    >
                      {isValidating ? (
                        <span className="flex items-center justify-center">
                          <motion.span
                            className="w-5 h-5 border-2 border-warm-white/30 border-t-warm-white rounded-full mr-3"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Verifying...
                        </span>
                      ) : (
                        'Continue'
                      )}

                      {/* Corner decorations */}
                      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-golden-light/50 transition-all duration-300 group-hover:w-3 group-hover:h-3 group-hover:border-golden-light" />
                      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-golden-light/50 transition-all duration-300 group-hover:w-3 group-hover:h-3 group-hover:border-golden-light" />
                      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-golden-light/50 transition-all duration-300 group-hover:w-3 group-hover:h-3 group-hover:border-golden-light" />
                      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-golden-light/50 transition-all duration-300 group-hover:w-3 group-hover:h-3 group-hover:border-golden-light" />
                    </button>
                  </motion.div>
                </form>

                {/* Bottom flourish */}
                <motion.div
                  className="flex justify-center mt-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <svg width="40" height="20" viewBox="0 0 40 20" className="text-golden opacity-40">
                    <path
                      d="M0 10 L15 10 M25 10 L40 10"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <circle cx="20" cy="10" r="3" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                </motion.div>
              </div>

              {/* Bottom border */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-golden to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
