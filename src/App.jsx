import { useState, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Background } from './components/Background';
import { WeddingInvitation } from './components/WeddingInvitation';
import { BackgroundMusic } from './components/BackgroundMusic';
import { PhotoCarousel } from './components/PhotoCarousel';

// Lazy-load the wedding app and admin (code-split)
const WeddingApp = lazy(() => import('./wedding-app/WeddingApp'));
const AdminScreen = lazy(() => import('./wedding-app/screens/AdminScreen'));

function InvitationPage() {
  const [showCarousel, setShowCarousel] = useState(false);

  return (
    <div className="relative min-h-screen">
      <Background />
      <PhotoCarousel show={showCarousel} />
      <BackgroundMusic />
      <main className="relative z-10">
        <WeddingInvitation onEnvelopeOpen={() => setShowCarousel(true)} />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Existing wedding invitation site */}
      <Route path="/" element={<InvitationPage />} />

      {/* Admin dashboard — hidden at /admin, completely separate from /app */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
              <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8]">
              <AdminScreen />
            </div>
          </Suspense>
        }
      />

      {/* Wedding App — all /app/* routes */}
      <Route
        path="/app/*"
        element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
              <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <WeddingApp />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default App;
