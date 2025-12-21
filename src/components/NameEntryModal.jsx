import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuestValidation } from '../hooks/useGuestValidation';
import { PaperTexture } from './PaperTexture';

export function NameEntryModal({ isOpen, onValidName }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { validateGuest } = useGuestValidation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    await new Promise(resolve => setTimeout(resolve, 500));

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
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Decorative border - rounded */}
            <div className="absolute -inset-2.5 border border-golden/20 rounded-xl" />

            {/* Card with paper texture */}
            <div className="relative overflow-hidden rounded-lg shadow-xl">
              {/* Paper texture */}
              <PaperTexture />

              {/* Top line */}
              <div className="relative h-px bg-gradient-to-r from-transparent via-golden/60 to-transparent" />

              <div className="relative px-10 py-12 md:px-12 md:py-14">
                {/* Title */}
                <h2 className="font-serif text-3xl text-charcoal text-center italic font-light mb-3">
                  Welcome
                </h2>

                <p className="text-charcoal-light text-center text-sm tracking-wide mb-8">
                  Please enter your name
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    placeholder="Your name"
                    className="w-full px-5 py-4 border border-golden/30 bg-warm-white/50 font-serif text-lg text-charcoal placeholder-charcoal-light/40 focus:outline-none focus:border-golden transition-colors text-center rounded-md"
                    autoFocus
                  />

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        className="mt-4 text-terracotta text-sm text-center italic"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Button - rounded */}
                  <div className="mt-8 flex justify-center">
                    <button
                      type="submit"
                      disabled={isValidating || !name.trim()}
                      className="relative px-10 py-3.5 bg-terracotta text-warm-white font-serif text-lg italic tracking-wide rounded-md transition-all duration-300 hover:bg-terracotta-dark disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isValidating ? 'Verifying...' : 'Continue'}

                      {/* Corner accents */}
                      <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t border-l border-golden-light/50 rounded-tl-sm" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t border-r border-golden-light/50 rounded-tr-sm" />
                      <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b border-l border-golden-light/50 rounded-bl-sm" />
                      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b border-r border-golden-light/50 rounded-br-sm" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Bottom line */}
              <div className="relative h-px bg-gradient-to-r from-transparent via-golden/60 to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
