import { Component, lazy, Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
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

const CHUNK_ERROR = /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk/i;

/**
 * If a page's code fails to download (a dropped connection, or a new deploy
 * replaced the files while the tab was open), reload once to pick up the
 * current version; otherwise offer a reload instead of a blank screen.
 */
class PageErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (!CHUNK_ERROR.test(String(error?.message))) return;
    try {
      if (sessionStorage.getItem('sn:reloaded')) return;
      sessionStorage.setItem('sn:reloaded', '1');
    } catch {
      return;
    }
    window.location.reload();
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0B0509', color: '#F4EDE3', fontFamily: 'Georgia, serif', textAlign: 'center', padding: 24 }}>
        <div>
          <p style={{ fontSize: 20, fontStyle: 'italic', margin: '0 0 20px' }}>This page didn’t load properly.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ minHeight: 46, padding: '0 24px', border: '1px solid rgba(201,169,97,0.6)', background: 'transparent', color: '#F1DFB0', fontSize: 16, letterSpacing: '0.12em', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}

function App() {
  return (
    <PageErrorBoundary>
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

        {/* anything else (an old or mistyped link) goes to the thank-you card */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageErrorBoundary>
  );
}

export default App;
