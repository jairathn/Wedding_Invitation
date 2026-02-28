// Guest Directory — /app/directory
// Alphabetical list with instant search

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, User } from 'lucide-react';
import { getAllGuests, searchGuests, type GuestSuggestion } from '../lib/guest-search';

export default function DirectoryScreen() {
  const [query, setQuery] = useState('');
  const allGuests = useMemo(() => getAllGuests(), []);

  const displayedGuests = useMemo(() => {
    if (!query.trim()) return allGuests;
    return searchGuests(query);
  }, [query, allGuests]);

  // Group by first letter of last name
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
    <div className="min-h-full px-4 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-2xl font-semibold text-[#f5f0e8] mb-4"
      >
        Guest Directory
      </motion.h1>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-6"
      >
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0998c]" />
        <input
          type="text"
          placeholder="Search guests..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[#f5f0e8] placeholder-[#a0998c]/50 font-sans text-sm focus:outline-none focus:border-[#c9a84c]/50 transition-all"
        />
      </motion.div>

      {/* Guest count */}
      <p className="text-xs text-[#a0998c] mb-4 font-sans">
        {displayedGuests.length} guest{displayedGuests.length !== 1 ? 's' : ''}
      </p>

      {/* Grouped list */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([letter, guests]) => (
          <div key={letter}>
            <h3 className="text-xs font-sans font-semibold text-[#c9a84c] uppercase tracking-wider mb-2 sticky top-0 bg-[#0a0a0a] py-1 z-10">
              {letter}
            </h3>
            <div className="space-y-0.5">
              {guests.map((guest, i) => (
                <div
                  key={`${guest.fullName}-${i}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center shrink-0">
                    <User size={14} className="text-[#a0998c]" />
                  </div>
                  <span className="text-sm text-[#f5f0e8] font-sans">
                    {guest.firstName} <span className="text-[#a0998c]">{guest.lastName}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {displayedGuests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#a0998c] font-serif italic">No guests found</p>
        </div>
      )}
    </div>
  );
}
