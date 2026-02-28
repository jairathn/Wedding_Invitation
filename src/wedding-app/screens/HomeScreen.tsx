// Home Screen — /app/home
// Warm card grid with Barcelona sunshine feel

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Camera, CalendarDays, Users, Images, Sparkles } from 'lucide-react';
import Monogram from '../components/Monogram';
import { getStoredSession } from '../lib/session';
import { getCurrentEvent, getNextEvent } from '../constants';

const FEATURES = [
  {
    icon: Video,
    title: 'Video Message',
    subtitle: 'Record a wish for the couple',
    path: '/app/video',
    iconColor: '#C4704B',
  },
  {
    icon: Camera,
    title: 'Photo Booth',
    subtitle: 'Take photos with fun filters',
    path: '/app/photo',
    iconColor: '#2B5F8A',
  },
  {
    icon: CalendarDays,
    title: 'Schedule',
    subtitle: 'Wedding weekend events',
    path: '/app/schedule',
    iconColor: '#7A8B5C',
  },
  {
    icon: Users,
    title: 'Guests',
    subtitle: 'Find your fellow guests',
    path: '/app/directory',
    iconColor: '#E8865A',
  },
  {
    icon: Images,
    title: 'My Gallery',
    subtitle: 'View your photos & videos',
    path: '/app/gallery',
    iconColor: '#D4A853',
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
    <div className="min-h-full px-5 pt-6 pb-4 bg-[#FEFCF9]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <p className="text-[13px] text-[#8A8078] mb-0.5">Welcome,</p>
          <h1 className="text-[24px] font-serif font-semibold text-[#2C2825] leading-tight">
            {firstName}
          </h1>
        </div>
        <Monogram size={44} />
      </motion.div>

      {/* Current event banner */}
      {activeEvent && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          onClick={() => navigate('/app/schedule')}
          className="w-full mb-6 group text-left"
        >
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(44,40,37,0.06)] border border-[#E8DDD3]/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={13} className="text-[#D4A853]" />
                  <span className="text-[11px] font-semibold tracking-wide uppercase text-[#D4A853]">
                    {currentEvent ? 'Happening Now' : 'Up Next'}
                  </span>
                </div>
                <h2 className="text-[17px] font-serif font-semibold text-[#2C2825]">
                  {activeEvent.name}
                </h2>
                <p className="text-[13px] text-[#8A8078] mt-0.5">
                  {activeEvent.venueName} · {new Date(activeEvent.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F7F3ED] flex items-center justify-center group-hover:bg-[#E8DDD3] transition-colors">
                <CalendarDays size={16} className="text-[#C4704B]" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </motion.button>
      )}

      {/* Feature cards — 2 column grid */}
      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.button
              key={feat.path}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.05, duration: 0.35 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(feat.path)}
              className="bg-white rounded-2xl p-4 text-left shadow-[0_2px_12px_rgba(44,40,37,0.06)] border border-[#E8DDD3]/30 hover:shadow-[0_4px_16px_rgba(44,40,37,0.1)] transition-shadow duration-200"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${feat.iconColor}12` }}
              >
                <Icon size={22} style={{ color: feat.iconColor }} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-semibold text-[15px] text-[#2C2825]">
                {feat.title}
              </h3>
              <p className="text-[12px] text-[#8A8078] mt-0.5 leading-relaxed">
                {feat.subtitle}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
