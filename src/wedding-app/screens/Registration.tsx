// Registration Screen — /app
// Dramatic entry with gradient mesh and frosted glass form

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
    <div className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden px-6 bg-[#050505]">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] rounded-full bg-[#c9a84c]/[0.06] blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[45%] rounded-full bg-rose-600/[0.04] blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-violet-600/[0.03] blur-[80px]" />
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

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
          <Monogram size={100} />
        </motion.div>

        {/* Welcome text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center mt-8 mb-10"
        >
          <h1 className="font-serif text-[32px] font-semibold text-white tracking-wide leading-tight">
            Welcome
          </h1>
          <p className="text-[14px] text-white/30 mt-2 tracking-wide">
            Neil & Shriya's Wedding
          </p>
        </motion.div>

        {/* Frosted glass form card */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="w-full space-y-3"
        >
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-5 space-y-3">
            <div className="relative" ref={suggestionsRef}>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => handleFirstNameChange(e.target.value)}
                autoComplete="off"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/25 font-sans text-[15px] focus:outline-none focus:border-[#c9a84c]/40 focus:bg-white/[0.07] transition-all duration-200"
              />

              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-[#1a1a1f]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl z-20"
                  >
                    {suggestions.map((guest, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectSuggestion(guest)}
                        className="w-full text-left px-4 py-3 text-[14px] text-white/80 hover:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-0"
                      >
                        <span className="font-medium text-white">{guest.firstName}</span>{' '}
                        <span className="text-white/40">{guest.lastName}</span>
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
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/25 font-sans text-[15px] focus:outline-none focus:border-[#c9a84c]/40 focus:bg-white/[0.07] transition-all duration-200"
            />
          </div>

          {error && (
            <p className="text-red-400/80 text-[13px] text-center">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-[#c9a84c] hover:bg-[#d4b55a] text-[#0a0a0a] font-sans font-semibold text-[15px] rounded-xl py-3.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#c9a84c]/10"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
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
