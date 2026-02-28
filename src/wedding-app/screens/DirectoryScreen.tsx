// Guest Directory — /app/directory
// Clean alphabetical list with glassmorphic search

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { getAllGuests, searchGuests, type GuestSuggestion } from '../lib/guest-search';

export default function DirectoryScreen() {
  const [query, setQuery] = useState('');
  const allGuests = useMemo(() => getAllGuests(), []);

  const displayedGuests = useMemo(() => {
    if (!query.trim()) return allGuests;
    return searchGuests(query);
  }, [query, allGuests]);

  const grouped = useMemo(() => {
    const groups: Record<string, GuestSuggestion[]> = {};
    const sorted = [...displayedGuests].sort((a, b) =>
      a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
    );
    for (const guest of sorted) {
      const letter = guest.lastName.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(guest);
    }
    return groups;
  }, [displayedGuests]);

  return (
    <div className="min-h-full px-5 py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-serif text-[26px] font-semibold text-white">
          Guests
        </h1>
        <p className="text-[13px] text-white/25 mt-1">
          {allGuests.length} celebrating together
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-6"
      >
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type="text"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/20 font-sans text-[14px] focus:outline-none focus:border-[#c9a84c]/30 focus:bg-white/[0.06] transition-all duration-200"
        />
      </motion.div>

      {/* Grouped list */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([letter, guests], gi) => (
          <motion.div
            key={letter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 + gi * 0.02 }}
          >
            <h3 className="text-[11px] font-semibold text-[#c9a84c]/60 tracking-[0.15em] uppercase mb-2 pl-1">
              {letter}
            </h3>
            <div className="space-y-0.5">
              {guests.map((guest, i) => {
                const initials = `${guest.firstName.charAt(0)}${guest.lastName.charAt(0)}`;
                return (
                  <div
                    key={`${guest.fullName}-${i}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/[0.08] to-white/[0.03] flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-semibold text-white/40">{initials}</span>
                    </div>
                    <span className="text-[14px] text-white/70 font-sans">
                      {guest.firstName}{' '}
                      <span className="text-white/30">{guest.lastName}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {displayedGuests.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/20 text-[14px]">No guests found</p>
        </div>
      )}
    </div>
  );
}
