// Wedding App Layout — Light, warm, Instagram-style
// Bottom tab bar with elevated Photo button and terracotta active state

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Video, Camera, CalendarDays, Images, ChevronLeft } from 'lucide-react';
import UploadIndicator from './components/UploadIndicator';

const NAV_ITEMS = [
  { path: '/app/home', icon: Home, label: 'Home' },
  { path: '/app/video', icon: Video, label: 'Video' },
  { path: '/app/photo', icon: Camera, label: 'Photo', isCenter: true },
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
    <div className="min-h-[100dvh] bg-[#FEFCF9] text-[#2C2825] flex flex-col">
      {/* Top bar — inner pages only */}
      {showBackBar && (
        <header className="sticky top-0 z-30 bg-[#FEFCF9]/90 backdrop-blur-md border-b border-[#E8DDD3]/60">
          <div className="flex items-center h-12 px-4">
            <button
              onClick={() => navigate('/app/home')}
              className="flex items-center gap-1 text-[#8A8078] hover:text-[#2C2825] transition-colors -ml-1"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
              <span className="text-[13px] font-medium">Back</span>
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 text-[13px] font-semibold tracking-wide text-[#2C2825]">
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

      {/* Bottom tab bar — Instagram style with elevated center button */}
      <nav className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F0EBE1] px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-end h-16">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            // Elevated center button (Photo)
            if (item.isCenter) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center -mt-4 transition-transform active:scale-95"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg mb-0.5"
                    style={{
                      background: 'linear-gradient(145deg, #D4845C, #C4704B)',
                      boxShadow: '0 4px 16px rgba(196,112,75,0.35)',
                    }}
                  >
                    <Icon size={24} strokeWidth={1.8} className="text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#C4704B]">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 transition-colors"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2 : 1.5}
                  fill={isActive ? '#C4704B' : 'none'}
                  className={`transition-colors ${
                    isActive ? 'text-[#C4704B]' : 'text-[#B8AFA6]'
                  }`}
                />
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#C4704B]' : 'text-[#B8AFA6]'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
