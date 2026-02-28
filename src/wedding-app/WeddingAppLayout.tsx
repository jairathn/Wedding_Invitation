// Wedding App Layout — Dark cinematic theme
// Wraps all /app/* routes

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Camera, Video, CalendarDays, Users, Images, ArrowLeft } from 'lucide-react';
import UploadIndicator from './components/UploadIndicator';

const NAV_ITEMS = [
  { path: '/app/home', icon: Home, label: 'Home' },
  { path: '/app/video', icon: Video, label: 'Video' },
  { path: '/app/photo', icon: Camera, label: 'Photo' },
  { path: '/app/schedule', icon: CalendarDays, label: 'Schedule' },
  { path: '/app/directory', icon: Users, label: 'Guests' },
  { path: '/app/gallery', icon: Images, label: 'My Media' },
];

export default function WeddingAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegistration = location.pathname === '/app' || location.pathname === '/app/';
  const isReview = location.pathname === '/app/review';
  const isVideoOrPhoto = location.pathname === '/app/video' || location.pathname === '/app/photo';

  // Hide nav on registration, review, and capture screens
  const showNav = !isRegistration && !isReview && !isVideoOrPhoto;

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-[#f5f0e8] flex flex-col">
      {/* Top bar — only show when nav is visible and not on home */}
      {showNav && location.pathname !== '/app/home' && (
        <header className="flex items-center px-4 py-3 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/5">
          <button
            onClick={() => navigate('/app/home')}
            className="flex items-center gap-2 text-[#a0998c] hover:text-[#f5f0e8] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-sans">Back</span>
          </button>
        </header>
      )}

      {/* Main content */}
      <main className="flex-1 relative">
        <UploadIndicator />
        <Outlet />
      </main>

      {/* Bottom navigation — mobile style */}
      {showNav && (
        <nav className="bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-white/5 px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="flex justify-around items-center h-16">
            {NAV_ITEMS.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'text-[#c9a84c]'
                      : 'text-[#a0998c] hover:text-[#f5f0e8]'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
