// Wedding App Router
// All /app/* routes defined here, loaded lazily for code splitting

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import WeddingAppLayout from './WeddingAppLayout';

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
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function WeddingApp() {
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
