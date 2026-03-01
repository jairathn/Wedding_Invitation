// Wedding App Layout — Matching design spec exactly
// Frosted glass bottom nav with elevated Photo button, inline SVG icons

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import UploadIndicator from './components/UploadIndicator';

// Inline SVG icon renderers matching the design spec
const NAV_ICONS = {
  home: (active: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#C4704B' : 'none'} stroke={active ? '#C4704B' : '#A09890'} strokeWidth="1.8">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  video: (active: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#C4704B' : '#A09890'} strokeWidth="1.8">
      <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
    </svg>
  ),
  photo: (active: boolean) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : '#A09890'} strokeWidth="1.8">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
    </svg>
  ),
  events: (active: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#C4704B' : '#A09890'} strokeWidth="1.8">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
  gallery: (active: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#C4704B' : '#A09890'} strokeWidth="1.8">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'home', path: '/app/home', label: 'Home', icon: NAV_ICONS.home },
  { id: 'video', path: '/app/video', label: 'Video', icon: NAV_ICONS.video },
  { id: 'photo', path: '/app/photo', label: 'Photo', icon: NAV_ICONS.photo, isCenter: true },
  { id: 'events', path: '/app/schedule', label: 'Events', icon: NAV_ICONS.events },
  { id: 'gallery', path: '/app/gallery', label: 'Gallery', icon: NAV_ICONS.gallery },
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
    <div style={{
      minHeight: '100dvh',
      background: '#FEFCF9',
      color: '#2C2825',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'DM Sans', -apple-system, sans-serif",
    }}>
      {/* Top bar — inner pages only */}
      {showBackBar && (
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(254,252,249,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(232,221,211,0.6)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: 48,
            padding: '0 16px',
            position: 'relative',
          }}>
            <button
              onClick={() => navigate('/app/home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(196,112,75,0.08)',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                justifyContent: 'center',
                cursor: 'pointer',
                marginLeft: -4,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4704B" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: '#2C2825',
            }}>
              {pageTitle[location.pathname]}
            </span>
          </div>
        </header>
      )}

      {/* Main content */}
      <main style={{ flex: 1, position: 'relative' }}>
        <UploadIndicator />
        <Outlet />
      </main>

      {/* Bottom Navigation — matching design spec */}
      <nav style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 100,
        background: 'rgba(255,252,249,0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(232,221,211,0.4)',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path;

          // Elevated center Photo button
          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  position: 'relative',
                  top: -12,
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C4704B 0%, #E8865A 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(196, 112, 75, 0.35)',
                }}>
                  {item.icon(true)}
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#C4704B',
                  letterSpacing: '0.01em',
                }}>{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 12px',
              }}
            >
              {item.icon(isActive)}
              <span style={{
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#C4704B' : '#A09890',
                letterSpacing: '0.01em',
              }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
