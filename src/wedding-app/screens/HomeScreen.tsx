// Home Screen — /app/home
// Airbnb-style hero cards with warm gradients, sun-drenched Barcelona feel

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Camera, CalendarDays, Users, Images, Sparkles, ChevronRight } from 'lucide-react';
import Monogram from '../components/Monogram';
import { getStoredSession } from '../lib/session';
import { getCurrentEvent, getNextEvent } from '../constants';

// Hero cards — top row, larger
const HERO_FEATURES = [
  {
    icon: Video,
    title: 'Video Message',
    subtitle: 'Record a wish for the couple',
    path: '/app/video',
    gradient: 'linear-gradient(145deg, #F9E8DF 0%, #F2D1C0 40%, #E8B5A0 100%)',
    iconColor: '#C4704B',
    iconBg: 'rgba(196,112,75,0.15)',
  },
  {
    icon: Camera,
    title: 'Photo Booth',
    subtitle: 'Take photos with fun filters',
    path: '/app/photo',
    gradient: 'linear-gradient(145deg, #F5E6E0 0%, #EDDCD4 40%, #E8C4B8 100%)',
    iconColor: '#B5614F',
    iconBg: 'rgba(181,97,79,0.15)',
  },
];

// Secondary cards — bottom row of 3
const SECONDARY_FEATURES = [
  {
    icon: CalendarDays,
    title: 'Schedule',
    subtitle: 'Events & venues',
    path: '/app/schedule',
    gradient: 'linear-gradient(145deg, #E8F0F7 0%, #D4E4F0 40%, #BDD5EA 100%)',
    iconColor: '#2B5F8A',
    iconBg: 'rgba(43,95,138,0.12)',
  },
  {
    icon: Users,
    title: 'Guests',
    subtitle: 'Find friends',
    path: '/app/directory',
    gradient: 'linear-gradient(145deg, #FDF2E8 0%, #F8E4D0 40%, #F2D4B8 100%)',
    iconColor: '#D48040',
    iconBg: 'rgba(212,128,64,0.15)',
  },
  {
    icon: Images,
    title: 'Gallery',
    subtitle: 'Your memories',
    path: '/app/gallery',
    gradient: 'linear-gradient(145deg, #F0F2E8 0%, #E2E8D6 40%, #D5DFC6 100%)',
    iconColor: '#7A8B5C',
    iconBg: 'rgba(122,139,92,0.15)',
  },
];

const EVENT_BANNER_STYLES: Record<string, { bg: string; border: string }> = {
  haldi: { bg: 'linear-gradient(135deg, #FDF6EE 0%, #FAF0E0 50%, #F7E8D0 100%)', border: '#D4A853' },
  sangeet: { bg: 'linear-gradient(135deg, #FEF5F0 0%, #FCEEE6 50%, #FAE4D8 100%)', border: '#E8865A' },
  wedding_reception: { bg: 'linear-gradient(135deg, #F0F5FA 0%, #E8EEF5 50%, #DFE7F0 100%)', border: '#2B5F8A' },
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const currentEvent = getCurrentEvent();
  const nextEvent = getNextEvent();
  const activeEvent = currentEvent || nextEvent;
  const firstName = session?.guest?.firstName || 'Guest';
  const bannerStyle = activeEvent ? EVENT_BANNER_STYLES[activeEvent.slug] || EVENT_BANNER_STYLES.wedding_reception : null;

  return (
    <div className="min-h-full bg-[#FEFCF9]">
      {/* Subtle warm gradient overlay */}
      <div
        className="min-h-full"
        style={{ background: 'linear-gradient(180deg, #FEFCF9 0%, #FBF7F1 50%, #FEFCF9 100%)' }}
      >
        <div className="px-5 pt-6 pb-4">

          {/* Welcome header — warm, breathing, personal */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-5"
          >
            <div>
              <p className="text-[14px] text-[#8A8078] font-sans font-normal leading-relaxed">
                Welcome,
              </p>
              <h1 className="text-[32px] font-serif font-semibold text-[#2C2825] leading-tight -mt-0.5">
                {firstName}
              </h1>
            </div>
            <Monogram size={44} />
          </motion.div>

          {/* Event banner — warm gradient card with presence */}
          {activeEvent && bannerStyle && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/app/schedule')}
              className="w-full mb-6 group text-left"
            >
              <div
                className="rounded-2xl p-5 border border-white/60 relative overflow-hidden"
                style={{
                  background: bannerStyle.bg,
                  boxShadow: `0 4px 20px rgba(196,112,75,0.08), inset 0 1px 0 rgba(255,255,255,0.6)`,
                }}
              >
                {/* Decorative accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                  style={{ backgroundColor: bannerStyle.border }}
                />

                <div className="flex items-center justify-between pl-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5 bg-white/70 rounded-full pl-2 pr-3 py-1">
                        <Sparkles size={12} className="text-[#D4A853]" />
                        <span className="text-[11px] font-semibold tracking-wide uppercase text-[#D4A853]">
                          {currentEvent ? 'Happening Now' : 'Up Next'}
                        </span>
                      </div>
                    </div>
                    <h2 className="text-[20px] font-serif font-semibold text-[#2C2825] leading-snug">
                      {activeEvent.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-[#8A8078]">
                      <CalendarDays size={13} strokeWidth={1.5} />
                      <span className="text-[13px]">
                        {new Date(activeEvent.date + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-[#B8AFA6]">·</span>
                      <span className="text-[13px]">{activeEvent.venueName}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shrink-0 ml-3 group-hover:bg-white/80 transition-colors">
                    <ChevronRight size={18} className="text-[#C4704B]" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </motion.button>
          )}

          {/* Hero cards — Video & Photo — large, inviting, tappable */}
          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            {HERO_FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.button
                  key={feat.path}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(feat.path)}
                  className="relative overflow-hidden text-center"
                  style={{
                    background: feat.gradient,
                    borderRadius: 20,
                    minHeight: 160,
                    boxShadow: '0 4px 20px rgba(196,112,75,0.12)',
                  }}
                >
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-[20px] border border-white/50 pointer-events-none" />

                  <div className="flex flex-col items-center justify-center h-full px-4 py-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: feat.iconBg }}
                    >
                      <Icon size={28} style={{ color: feat.iconColor }} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif font-semibold text-[16px] text-[#2C2825] leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-[12px] text-[#8A8078] mt-1 leading-relaxed">
                      {feat.subtitle}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Secondary cards — row of 3, slightly smaller */}
          <div className="grid grid-cols-3 gap-3">
            {SECONDARY_FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.button
                  key={feat.path}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(feat.path)}
                  className="relative overflow-hidden text-center"
                  style={{
                    background: feat.gradient,
                    borderRadius: 18,
                    minHeight: 130,
                    boxShadow: '0 3px 16px rgba(196,112,75,0.08)',
                  }}
                >
                  <div className="absolute inset-0 rounded-[18px] border border-white/50 pointer-events-none" />

                  <div className="flex flex-col items-center justify-center h-full px-3 py-5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-2.5"
                      style={{ backgroundColor: feat.iconBg }}
                    >
                      <Icon size={24} style={{ color: feat.iconColor }} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif font-semibold text-[14px] text-[#2C2825] leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-[11px] text-[#8A8078] mt-0.5 leading-relaxed">
                      {feat.subtitle}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
