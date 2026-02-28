// Home Screen — /app/home
// Bento grid with glassmorphic cards and gradient mesh background

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Camera, CalendarDays, Users, Images, ChevronRight, Sparkles } from 'lucide-react';
import Monogram from '../components/Monogram';
import { getStoredSession } from '../lib/session';
import { getCurrentEvent, getNextEvent } from '../constants';

const FEATURES = [
  {
    icon: Video,
    title: 'Video Message',
    subtitle: 'Record a wish',
    path: '/app/video',
    gradient: 'from-rose-500/20 to-orange-500/10',
    iconColor: '#f87171',
    span: 'col-span-1',
  },
  {
    icon: Camera,
    title: 'Photo Booth',
    subtitle: 'Strike a pose',
    path: '/app/photo',
    gradient: 'from-amber-500/20 to-yellow-500/10',
    iconColor: '#c9a84c',
    span: 'col-span-1',
  },
  {
    icon: CalendarDays,
    title: 'Schedule',
    subtitle: 'Wedding weekend events',
    path: '/app/schedule',
    gradient: 'from-emerald-500/15 to-teal-500/10',
    iconColor: '#6ee7b7',
    span: 'col-span-2',
  },
  {
    icon: Users,
    title: 'Guests',
    subtitle: 'Guest directory',
    path: '/app/directory',
    gradient: 'from-pink-500/15 to-rose-500/10',
    iconColor: '#f9a8d4',
    span: 'col-span-1',
  },
  {
    icon: Images,
    title: 'Gallery',
    subtitle: 'Your captures',
    path: '/app/gallery',
    gradient: 'from-violet-500/15 to-purple-500/10',
    iconColor: '#c4b5fd',
    span: 'col-span-1',
  },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const currentEvent = getCurrentEvent();
  const nextEvent = getNextEvent();
  const activeEvent = currentEvent || nextEvent;
  const firstName = session?.guest?.firstName || 'Guest';

  return (
    <div className="min-h-full px-5 pt-8 pb-4">
      {/* Gradient mesh background accent */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[70%] h-[60%] rounded-full bg-[#c9a84c]/[0.04] blur-[100px]" />
        <div className="absolute -bottom-[30%] -left-[20%] w-[60%] h-[50%] rounded-full bg-rose-500/[0.03] blur-[100px]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between mb-8"
      >
        <div>
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/30 mb-1">Welcome back</p>
          <h1 className="text-[28px] font-serif font-semibold text-white leading-tight">
            {firstName}
          </h1>
        </div>
        <Monogram size={48} className="opacity-60" />
      </motion.div>

      {/* Active event banner */}
      {activeEvent && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          onClick={() => navigate('/app/schedule')}
          className="relative z-10 w-full mb-8 group"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#c9a84c]/10 via-[#c9a84c]/5 to-transparent border border-[#c9a84c]/10 p-5">
            {/* Subtle shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9a84c]/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="flex items-center justify-between relative">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={12} className="text-[#c9a84c]" />
                  <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#c9a84c]">
                    {currentEvent ? 'Happening Now' : 'Up Next'}
                  </span>
                </div>
                <h2 className="text-lg font-serif font-semibold text-white">
                  {activeEvent.name}
                </h2>
                <p className="text-[13px] text-white/40 mt-0.5">
                  {activeEvent.venueName} · {new Date(activeEvent.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <ChevronRight size={20} className="text-white/20 group-hover:text-[#c9a84c]/60 transition-colors" />
            </div>
          </div>
        </motion.button>
      )}

      {/* Bento grid */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        {FEATURES.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.button
              key={feat.path}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(feat.path)}
              className={`${feat.span} relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 text-left group transition-all duration-300 hover:border-white/[0.1]`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
              {/* Glass layer */}
              <div className="absolute inset-0 bg-white/[0.02]" />

              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4">
                  <Icon size={20} style={{ color: feat.iconColor }} strokeWidth={1.5} />
                </div>
                <h3 className="font-sans font-semibold text-[15px] text-white/90 group-hover:text-white transition-colors">
                  {feat.title}
                </h3>
                <p className="text-[12px] text-white/35 mt-0.5">
                  {feat.subtitle}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
