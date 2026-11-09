import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import UpdatesPage from './components/UpdatesPage';
import Privacy from './components/Privacy';
import SmsTerms from './components/SmsTerms';

// Code-split each experience so guests only download the page they open
const ThankYouPage = lazy(() => import('./thank-you/ThankYouPage'));
const InvitationPage = lazy(() => import('./pages/InvitationPage'));
const WeddingApp = lazy(() => import('./wedding-app/WeddingApp'));
const AdminScreen = lazy(() => import('./wedding-app/screens/AdminScreen'));

const NightFallback = () => <div className="min-h-screen bg-[#0B0509]" />;
const CreamFallback = () => <div className="min-h-screen bg-[#F7F3ED]" />;

function App() {
  return (
    <Routes>
      {/* Thank-you card (home) */}
      <Route
        path="/"
        element={
          <Suspense fallback={<NightFallback />}>
            <ThankYouPage />
          </Suspense>
        }
      />

      {/* The original invitation, for guests who want to see it again */}
      <Route
        path="/invitation"
        element={
          <Suspense fallback={<CreamFallback />}>
            <InvitationPage />
          </Suspense>
        }
      />

      {/* Public SMS opt-in page (Twilio proof-of-consent URL) + policy pages */}
      <Route path="/public" element={<UpdatesPage />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/sms-terms" element={<SmsTerms />} />

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
            <div className="min-h-screen flex items-center justify-center bg-[#FEFCF9]">
              <div className="w-8 h-8 border-2 border-[#E8DDD3] border-t-[#C4704B] rounded-full animate-spin" />
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
