// Wedding App Router
// All /app/* routes defined here, loaded lazily for code splitting

import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import WeddingAppLayout from './WeddingAppLayout';

// Only the wedding-day app installs to the home screen as an app; the
// thank-you card and the invitation stay ordinary pages.
function useInstallableApp() {
  useEffect(() => {
    const added: HTMLElement[] = [];
    const add = (tag: string, attrs: Record<string, string>) => {
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      document.head.appendChild(el);
      added.push(el);
    };
    add('link', { rel: 'manifest', href: '/manifest.json' });
    add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
    add('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' });
    return () => added.forEach((el) => el.remove());
  }, []);
}

// Lazy-loaded screens
const Registration = lazy(() => import('./screens/Registration'));
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const VideoScreen = lazy(() => import('./screens/VideoScreen'));
const PhotoScreen = lazy(() => import('./screens/PhotoScreen'));
const ReviewScreen = lazy(() => import('./screens/ReviewScreen'));
const ScheduleScreen = lazy(() => import('./screens/ScheduleScreen'));
const DirectoryScreen = lazy(() => import('./screens/DirectoryScreen'));
const GalleryScreen = lazy(() => import('./screens/GalleryScreen'));
const EmailCollectScreen = lazy(() => import('./screens/EmailCollectScreen'));

function LoadingFallback() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#FEFCF9]">
      <div className="w-8 h-8 border-2 border-[#E8DDD3] border-t-[#C4704B] rounded-full animate-spin" />
    </div>
  );
}

export default function WeddingApp() {
  useInstallableApp();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Registration is outside the layout (no nav) */}
        <Route index element={<Registration />} />

        {/* All other screens use the layout with bottom nav */}
        <Route element={<WeddingAppLayout />}>
          <Route path="home" element={<HomeScreen />} />
          <Route path="schedule" element={<ScheduleScreen />} />
          <Route path="directory" element={<DirectoryScreen />} />
          <Route path="gallery" element={<GalleryScreen />} />
          <Route path="email-collect" element={<EmailCollectScreen />} />
        </Route>

        {/* Full-screen capture screens (no layout/nav) */}
        <Route path="video" element={<VideoScreen />} />
        <Route path="photo" element={<PhotoScreen />} />
        <Route path="review" element={<ReviewScreen />} />
      </Routes>
    </Suspense>
  );
}
