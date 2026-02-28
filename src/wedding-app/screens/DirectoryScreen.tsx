// Guest Directory — /app/directory
// Clean Instagram-contacts-list energy, warm and spacious

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { getAllGuests, searchGuests, type GuestSuggestion } from '../lib/guest-search';

const AVATAR_COLORS = ['#C4704B', '#2B5F8A', '#7A8B5C', '#D4A853', '#E8865A', '#E8C4B8'];

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
    <div className="min-h-full px-5 py-6 bg-[#FEFCF9]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="font-serif text-[24px] font-semibold text-[#2C2825]">
          Guests
        </h1>
        <p className="text-[13px] text-[#8A8078] mt-1">
          {allGuests.length} celebrating together
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-5"
      >
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8AFA6]" />
        <input
          type="text"
          placeholder="Search guests..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#F7F3ED] border border-[#E8DDD3] rounded-xl pl-10 pr-4 py-3 text-[#2C2825] placeholder-[#B8AFA6] font-sans text-[14px] focus:outline-none focus:border-[#C4704B]/40 focus:ring-2 focus:ring-[#C4704B]/10 transition-all"
        />
      </motion.div>

      {/* Grouped list */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([letter, guests], gi) => (
          <motion.div
            key={letter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 + gi * 0.02 }}
          >
            <h3 className="text-[11px] font-semibold text-[#C4704B] tracking-wider uppercase mb-2 pl-1">
              {letter}
            </h3>
            <div className="space-y-0.5">
              {guests.map((guest, i) => {
                const initials = `${guest.firstName.charAt(0)}${guest.lastName.charAt(0)}`;
                const bgColor = AVATAR_COLORS[(guest.firstName.charCodeAt(0) + guest.lastName.charCodeAt(0)) % AVATAR_COLORS.length];
                return (
                  <div
                    key={`${guest.fullName}-${i}`}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[#F7F3ED] transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${bgColor}18` }}
                    >
                      <span className="text-[11px] font-semibold" style={{ color: bgColor }}>{initials}</span>
                    </div>
                    <span className="text-[14px] text-[#2C2825] font-sans">
                      {guest.firstName}{' '}
                      <span className="text-[#8A8078]">{guest.lastName}</span>
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
          <p className="text-[#B8AFA6] text-[14px]">No guests found</p>
        </div>
      )}
    </div>
  );
}
