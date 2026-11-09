import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Background } from '../components/Background';
import { WeddingInvitation } from '../components/WeddingInvitation';
import { BackgroundMusic } from '../components/BackgroundMusic';
import { PhotoCarousel } from '../components/PhotoCarousel';

/** The original invitation, preserved at /invitation. */
export default function InvitationPage() {
  const [showCarousel, setShowCarousel] = useState(false);

  // Browser chrome colour: the invitation's terracotta, not the night theme
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const prev = meta?.getAttribute('content');
    meta?.setAttribute('content', '#C4725E');
    return () => {
      if (meta && prev) meta.setAttribute('content', prev);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <Background />
      <PhotoCarousel show={showCarousel} />
      <BackgroundMusic />
      <main className="relative z-10">
        <WeddingInvitation onEnvelopeOpen={() => setShowCarousel(true)} />
      </main>

      {/* Way back to the thank-you card (top right, clear of the music button) */}
      <Link
        to="/"
        className="fixed right-4 top-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-charcoal/10 bg-warm-white/75 font-sans text-[10px] uppercase tracking-[0.22em] text-charcoal/60 shadow-sm backdrop-blur-sm transition-colors hover:text-terracotta"
        style={{ padding: '8px 14px 8px 12px' }} /* this page keeps the legacy reset, so no padding utilities */
      >
        <span aria-hidden="true">←</span> Our thank-you
      </Link>

      {/* Subtle, always-visible public link (Twilio web presence) */}
      <Link
        to="/public"
        className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap font-sans text-[10px] uppercase tracking-[0.25em] text-charcoal/40 transition-colors hover:text-terracotta"
      >
        Wedding Text Updates
      </Link>
    </div>
  );
}
