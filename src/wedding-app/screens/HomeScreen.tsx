// Home Screen — /app/home
// Grid of cards for each feature, with current event highlight

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Camera, CalendarDays, Users, Images } from 'lucide-react';
import Monogram from '../components/Monogram';
import { getStoredSession } from '../lib/session';
import { getCurrentEvent, getNextEvent } from '../constants';

const CARDS = [
  {
    icon: Video,
    title: 'Video Message',
    subtitle: 'Record a message for the bride & groom',
    path: '/app/video',
    color: '#c45c5c',
  },
  {
    icon: Camera,
    title: 'Photo Booth',
    subtitle: 'Take photos with wedding filters',
    path: '/app/photo',
    color: '#c9a84c',
  },
  {
    icon: CalendarDays,
    title: 'Schedule',
    subtitle: 'View the wedding weekend events',
    path: '/app/schedule',
    color: '#7d9b76',
  },
  {
    icon: Users,
    title: 'Guest Directory',
    subtitle: 'Find your fellow guests',
    path: '/app/directory',
    color: '#d4a0a0',
  },
  {
    icon: Images,
    title: 'My Media',
    subtitle: 'View your photos & videos',
    path: '/app/gallery',
    color: '#d4a843',
  },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const currentEvent = getCurrentEvent();
  const nextEvent = getNextEvent();
  const activeEvent = currentEvent || nextEvent;

  return (
    <div className="min-h-full px-4 py-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Monogram size={44} />
        <div>
          <p className="text-sm text-[#a0998c] font-sans">Welcome,</p>
          <h1 className="text-xl font-serif font-semibold text-[#f5f0e8]">
            {session?.guest?.firstName || 'Guest'}
          </h1>
        </div>
      </motion.div>

      {/* Current event banner */}
      {activeEvent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-[#c9a84c]/15 to-[#c9a84c]/5 border border-[#c9a84c]/20 rounded-2xl p-4 mb-6"
        >
          <p className="text-xs text-[#c9a84c] font-sans font-medium uppercase tracking-wider">
            {currentEvent ? 'Happening Now' : 'Up Next'}
          </p>
          <h2 className="text-lg font-serif font-semibold text-[#f5f0e8] mt-1">
            {activeEvent.name}
          </h2>
          <p className="text-sm text-[#a0998c] mt-0.5">
            {activeEvent.venueName} · {new Date(activeEvent.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </motion.div>
      )}

      {/* Feature cards */}
      <div className="grid grid-cols-1 gap-3">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.path}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(card.path)}
              className="flex items-center gap-4 bg-[#1a1a2e]/60 border border-white/5 rounded-2xl p-4 text-left hover:bg-[#1a1a2e] transition-colors group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <Icon size={22} style={{ color: card.color }} />
              </div>
              <div className="min-w-0">
                <h3 className="font-sans font-semibold text-[#f5f0e8] text-base group-hover:text-white transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-[#a0998c] mt-0.5 truncate">
                  {card.subtitle}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
