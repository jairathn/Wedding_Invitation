// Wedding App Layout — Sleek modern shell
// Floating glass bottom nav, clean top bar

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Video, Camera, CalendarDays, Images, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import UploadIndicator from './components/UploadIndicator';

const NAV_ITEMS = [
  { path: '/app/home', icon: Home, label: 'Home' },
  { path: '/app/video', icon: Video, label: 'Video' },
  { path: '/app/photo', icon: Camera, label: 'Photo' },
  { path: '/app/schedule', icon: CalendarDays, label: 'Events' },
  { path: '/app/gallery', icon: Images, label: 'Gallery' },
];

export default function WeddingAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle: Record<string, string> = {
    '/app/schedule': 'Events',
    '/app/directory': 'Guests',
    '/app/gallery': 'Gallery',
    '/app/email-collect': 'Stay Connected',
  };

  const showBackBar = pageTitle[location.pathname] !== undefined;

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-[#f5f0e8] flex flex-col">
      {/* Top bar with back button — inner pages only */}
      {showBackBar && (
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#050505]/80 border-b border-white/[0.04]">
          <div className="flex items-center h-12 px-4">
            <button
              onClick={() => navigate('/app/home')}
              className="flex items-center gap-1 text-white/50 hover:text-white transition-colors -ml-1"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
              <span className="text-[13px] font-medium tracking-wide">Back</span>
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 text-[13px] font-semibold tracking-widest uppercase text-white/40">
              {pageTitle[location.pathname]}
            </span>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="flex-1 relative">
        <UploadIndicator />
        <Outlet />
      </main>

      {/* Floating bottom nav — glass pill */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-[max(env(safe-area-inset-bottom),8px)] px-4">
        <nav className="flex items-center gap-1 bg-[#111]/80 backdrop-blur-2xl border border-white/[0.06] rounded-2xl px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center w-[56px] h-[44px] rounded-xl transition-all duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/[0.08] rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-[#c9a84c]' : 'text-white/35'
                  }`}
                />
                <span className={`relative z-10 text-[9px] mt-0.5 font-medium tracking-wide transition-colors duration-200 ${
                  isActive ? 'text-[#c9a84c]' : 'text-white/30'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-[84px]" />
    </div>
  );
}
