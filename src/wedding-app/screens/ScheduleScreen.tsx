// Schedule Screen — /app/schedule
// Warm vertical timeline like a luxury wedding program

import { motion } from 'framer-motion';
import { EVENTS, getCurrentEvent } from '../constants';
import { MapPin, Clock } from 'lucide-react';

const EVENT_STYLES: Record<string, { color: string; bg: string }> = {
  haldi: { color: '#D4A853', bg: '#FDF6EE' },
  sangeet: { color: '#E8865A', bg: '#FEF5F0' },
  wedding_reception: { color: '#2B5F8A', bg: '#F0F5FA' },
};

export default function ScheduleScreen() {
  const currentEvent = getCurrentEvent();

  return (
    <div className="min-h-full px-5 py-6 bg-[#FEFCF9]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-serif text-[24px] font-semibold text-[#2C2825]">
          Wedding Weekend
        </h1>
        <p className="text-[13px] text-[#8A8078] mt-1">September 2026 · Barcelona</p>
      </motion.div>

      <div className="relative">
        {/* Terracotta connecting line */}
        <div className="absolute left-[15px] top-6 bottom-6 w-px bg-[#E8DDD3]" />

        <div className="space-y-4">
          {EVENTS.map((event, i) => {
            const isCurrent = currentEvent?.slug === event.slug;
            const style = EVENT_STYLES[event.slug] || { color: '#C4704B', bg: '#FDF6EE' };
            const eventDate = new Date(event.date + 'T12:00:00');

            return (
              <motion.div
                key={event.slug}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.35 }}
                className="relative flex gap-4"
              >
                {/* Timeline dot */}
                <div className="relative z-10 mt-5 shrink-0">
                  <div
                    className="w-[10px] h-[10px] rounded-full border-2 border-white"
                    style={{
                      backgroundColor: style.color,
                      boxShadow: isCurrent ? `0 0 0 3px ${style.color}25, 0 0 8px ${style.color}30` : `0 0 0 3px white`,
                    }}
                  />
                </div>

                {/* Event card */}
                <div
                  className="flex-1 bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(44,40,37,0.06)] border border-[#E8DDD3]/30"
                  style={{ borderLeftWidth: 3, borderLeftColor: style.color }}
                >
                  {isCurrent && (
                    <span
                      className="inline-block text-[10px] uppercase tracking-wider font-semibold mb-2 px-2.5 py-0.5 rounded-full"
                      style={{ color: style.color, backgroundColor: `${style.color}12` }}
                    >
                      Happening Now
                    </span>
                  )}

                  <h2 className="font-serif text-[18px] font-semibold text-[#2C2825]">
                    {event.name}
                  </h2>

                  <div className="flex items-center gap-1.5 mt-2.5 text-[#8A8078]">
                    <Clock size={14} strokeWidth={1.5} />
                    <span className="text-[13px]">
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 text-[#8A8078]">
                    <MapPin size={14} strokeWidth={1.5} />
                    <span className="text-[13px]">{event.venueName}</span>
                  </div>

                  {event.description && (
                    <p className="text-[13px] text-[#B8AFA6] mt-3 leading-relaxed italic">
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
