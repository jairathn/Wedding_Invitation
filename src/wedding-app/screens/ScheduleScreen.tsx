// Schedule Screen — /app/schedule
// Vertical timeline with event cards

import { motion } from 'framer-motion';
import { EVENTS, getCurrentEvent } from '../constants';
import { MapPin, Clock } from 'lucide-react';

const EVENT_COLORS: Record<string, string> = {
  haldi: '#d4a843',
  sangeet: '#d4a0a0',
  wedding_reception: '#c9a84c',
};

export default function ScheduleScreen() {
  const currentEvent = getCurrentEvent();

  return (
    <div className="min-h-full px-4 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-2xl font-semibold text-[#f5f0e8] mb-6"
      >
        Wedding Weekend
      </motion.h1>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-[17px] top-8 bottom-8 w-px bg-white/10" />

        <div className="space-y-4">
          {EVENTS.map((event, i) => {
            const isCurrent = currentEvent?.slug === event.slug;
            const color = EVENT_COLORS[event.slug] || '#c9a84c';
            const eventDate = new Date(event.date + 'T12:00:00');

            return (
              <motion.div
                key={event.slug}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex gap-4"
              >
                {/* Timeline dot */}
                <div className="relative z-10 mt-5">
                  <div
                    className={`w-[9px] h-[9px] rounded-full ring-4 ring-[#0a0a0a] ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
                    style={{
                      backgroundColor: color,
                      boxShadow: isCurrent ? `0 0 12px ${color}80` : 'none',
                    }}
                  />
                </div>

                {/* Event card */}
                <div
                  className={`flex-1 rounded-2xl p-5 border transition-all ${
                    isCurrent
                      ? 'bg-[#1a1a2e] border-[#c9a84c]/30'
                      : 'bg-[#1a1a2e]/40 border-white/5'
                  }`}
                  style={{ borderLeftWidth: 3, borderLeftColor: color }}
                >
                  {isCurrent && (
                    <span className="inline-block text-[10px] uppercase tracking-wider font-sans font-semibold text-[#c9a84c] mb-2">
                      Happening Now
                    </span>
                  )}

                  <h2 className="font-serif text-xl font-semibold text-[#f5f0e8]">
                    {event.name}
                  </h2>

                  <div className="flex items-center gap-4 mt-2 text-sm text-[#a0998c]">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} />
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-[#a0998c]">
                    <MapPin size={13} />
                    <span>{event.venueName}</span>
                  </div>

                  {event.description && (
                    <p className="text-sm text-[#a0998c]/80 mt-3 font-serif italic leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
