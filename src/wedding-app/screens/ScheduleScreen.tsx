// Schedule Screen — /app/schedule
// Clean timeline cards with gradient accents

import { motion } from 'framer-motion';
import { EVENTS, getCurrentEvent } from '../constants';
import { MapPin, Clock } from 'lucide-react';

const EVENT_COLORS: Record<string, { primary: string; bg: string }> = {
  haldi: { primary: '#f59e0b', bg: 'from-amber-500/15 to-yellow-500/5' },
  sangeet: { primary: '#ec4899', bg: 'from-pink-500/15 to-rose-500/5' },
  wedding_reception: { primary: '#c9a84c', bg: 'from-[#c9a84c]/15 to-amber-500/5' },
};

export default function ScheduleScreen() {
  const currentEvent = getCurrentEvent();

  return (
    <div className="min-h-full px-5 py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-serif text-[26px] font-semibold text-white">
          Wedding Weekend
        </h1>
        <p className="text-[13px] text-white/30 mt-1">September 2026 · Barcelona</p>
      </motion.div>

      <div className="space-y-4">
        {EVENTS.map((event, i) => {
          const isCurrent = currentEvent?.slug === event.slug;
          const colors = EVENT_COLORS[event.slug] || { primary: '#c9a84c', bg: 'from-[#c9a84c]/15 to-transparent' };
          const eventDate = new Date(event.date + 'T12:00:00');

          return (
            <motion.div
              key={event.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className={`relative overflow-hidden rounded-2xl border transition-all ${
                isCurrent ? 'border-white/[0.1]' : 'border-white/[0.04]'
              }`}>
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
                <div className="absolute inset-0 bg-white/[0.02]" />

                {/* Active glow */}
                {isCurrent && (
                  <div className="absolute -top-1 left-6 right-6 h-px" style={{ background: `linear-gradient(to right, transparent, ${colors.primary}40, transparent)` }} />
                )}

                <div className="relative p-5">
                  {/* Date chip */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary, boxShadow: isCurrent ? `0 0 8px ${colors.primary}60` : 'none' }} />
                      <span className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: colors.primary }}>
                        {eventDate.toLocaleDateString('en-US', { weekday: 'long' })}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#c9a84c] bg-[#c9a84c]/10 px-2.5 py-1 rounded-full">
                        Now
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif text-xl font-semibold text-white mb-3">
                    {event.name}
                  </h2>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white/35">
                      <Clock size={13} strokeWidth={1.5} />
                      <span className="text-[13px]">
                        {eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/35">
                      <MapPin size={13} strokeWidth={1.5} />
                      <span className="text-[13px]">{event.venueName}</span>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-[13px] text-white/25 mt-4 leading-relaxed font-serif italic">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
