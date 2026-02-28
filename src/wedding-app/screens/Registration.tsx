// Registration Screen — /app
// Full-screen dark entry with animated gradient, monogram, and name autocomplete

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Monogram from '../components/Monogram';
import { searchGuests, isOnGuestList, type GuestSuggestion } from '../lib/guest-search';
import { registerGuest, getStoredSession } from '../lib/session';

export default function Registration() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suggestions, setSuggestions] = useState<GuestSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Check for existing session
  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      navigate('/app/home', { replace: true });
    }
  }, [navigate]);

  // Autocomplete as user types
  const handleNameChange = useCallback((first: string, last: string) => {
    const query = `${first} ${last}`.trim();
    if (query.length >= 2) {
      const results = searchGuests(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    setError('');
    handleNameChange(value, lastName);
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    setError('');
    handleNameChange(firstName, value);
  };

  const selectSuggestion = (guest: GuestSuggestion) => {
    setFirstName(guest.firstName);
    setLastName(guest.lastName);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both your first and last name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await registerGuest(firstName, lastName);
      navigate('/app/home');
    } catch {
      // If API is down, create a local-only session
      const localSession = {
        id: crypto.randomUUID(),
        guestId: 0,
        guest: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          isOnGuestList: isOnGuestList(firstName, lastName),
        },
        deviceType: 'mobile' as const,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('wedding_app_session', JSON.stringify(localSession));
      navigate('/app/home');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, #1a1a2e 0%, #0a0a0a 50%), radial-gradient(ellipse at 70% 80%, #2a1f0a 0%, transparent 50%)',
          animation: 'gradient-shift 8s ease-in-out infinite alternate',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center"
      >
        {/* Monogram */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        >
          <Monogram size={120} />
        </motion.div>

        {/* Welcome text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center mt-8 mb-10"
        >
          <h1 className="font-serif text-3xl font-semibold text-[#f5f0e8] tracking-wide">
            Welcome
          </h1>
          <p className="font-serif text-lg text-[#a0998c] mt-2 italic">
            to Neil & Shriya's Wedding
          </p>
        </motion.div>

        {/* Name entry form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="w-full space-y-4"
        >
          <div className="relative" ref={suggestionsRef}>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              autoComplete="off"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-[#f5f0e8] placeholder-[#a0998c]/50 font-sans text-base focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/25 transition-all"
            />

            {/* Autocomplete suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden shadow-xl z-20"
                >
                  {suggestions.map((guest, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectSuggestion(guest)}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#f5f0e8] hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <span className="font-medium">{guest.firstName}</span>{' '}
                      <span className="text-[#a0998c]">{guest.lastName}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => handleLastNameChange(e.target.value)}
            autoComplete="off"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-[#f5f0e8] placeholder-[#a0998c]/50 font-sans text-base focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/25 transition-all"
          />

          {error && (
            <p className="text-[#c45c5c] text-sm text-center">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-[#c9a84c] text-[#0a0a0a] font-sans font-semibold text-base rounded-xl py-3.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e5c47a] transition-colors mt-2"
          >
            {isSubmitting ? 'Entering...' : 'Enter'}
          </motion.button>
        </motion.form>
      </motion.div>

      {/* Inline keyframes for gradient animation */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
      `}</style>
    </div>
  );
}
