// Registration Screen — /app
// Light, airy, Barcelona sunshine — warm cream with terracotta accents

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

  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      navigate('/app/home', { replace: true });
    }
  }, [navigate]);

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
    <div className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden px-6 bg-[#FEFCF9]">
      {/* Warm subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FEFCF9] via-[#FDF6EE] to-[#F7F3ED]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center"
      >
        {/* Monogram */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        >
          <Monogram size={80} />
        </motion.div>

        {/* Welcome text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-center mt-6 mb-10"
        >
          <h1 className="font-serif text-[28px] font-semibold text-[#2C2825] leading-tight">
            Welcome
          </h1>
          <p className="text-[15px] text-[#8A8078] mt-2">
            to Neil & Shriya's Wedding
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="w-full space-y-3"
        >
          <p className="text-[14px] text-[#8A8078] text-center mb-4">
            Enter your name to get started
          </p>

          <div className="relative" ref={suggestionsRef}>
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              autoComplete="off"
              className="w-full bg-[#F7F3ED] border border-[#E8DDD3] rounded-xl px-4 py-3.5 text-[#2C2825] placeholder-[#B8AFA6] font-sans text-[16px] focus:outline-none focus:border-[#C4704B]/50 focus:ring-2 focus:ring-[#C4704B]/10 transition-all"
            />

            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E8DDD3] rounded-xl overflow-hidden shadow-lg z-20"
                >
                  {suggestions.map((guest, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectSuggestion(guest)}
                      className="w-full text-left px-4 py-3 text-[15px] text-[#2C2825] hover:bg-[#F7F3ED] transition-colors border-b border-[#F7F3ED] last:border-0"
                    >
                      <span className="font-medium text-[#C4704B]">{guest.firstName}</span>{' '}
                      <span className="text-[#8A8078]">{guest.lastName}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => handleLastNameChange(e.target.value)}
            autoComplete="off"
            className="w-full bg-[#F7F3ED] border border-[#E8DDD3] rounded-xl px-4 py-3.5 text-[#2C2825] placeholder-[#B8AFA6] font-sans text-[16px] focus:outline-none focus:border-[#C4704B]/50 focus:ring-2 focus:ring-[#C4704B]/10 transition-all"
          />

          {error && (
            <p className="text-[#D4726A] text-[13px] text-center">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-[#C4704B] hover:bg-[#B5613E] text-white font-sans font-semibold text-[15px] rounded-full py-4 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entering...
              </span>
            ) : (
              'Enter'
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
