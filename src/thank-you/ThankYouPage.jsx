import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NightBackground } from './components/NightBackground';
import { SkyEffects } from './components/SkyEffects';
import { skyBurst } from './sky';
import { ThankYouEnvelope } from './components/ThankYouEnvelope';
import { ThankYouCard } from './components/ThankYouCard';
import { FilmStrips } from './components/FilmStrips';
import { PhotoGallery } from './components/PhotoGallery';
import { BackgroundMusic } from '../components/BackgroundMusic';
import { firstName, recallGuest, rememberGuest } from '../lib/guests';
import { THANK_YOU } from './config';
import photoManifest from './data/photos.json';

const EASE = [0.4, 0, 0.2, 1];
const photos = photoManifest.photos;

// Letters load in their own small chunk, only once someone opens the envelope
let lettersPromise;
const loadLetters = () => (lettersPromise ||= import('./data/letters.json').then((m) => m.default));

/** Shared gold gradient referenced by the card's SVG ornaments. */
function GoldDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ty-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3D9A4" />
          <stop offset="50%" stopColor="#D4A853" />
          <stop offset="100%" stopColor="#B8893A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TopBar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[30] flex items-center justify-end px-3 pt-3 md:px-6 md:pt-4">
      <Link
        to="/invitation"
        className="ty-caps pointer-events-auto inline-flex items-center gap-2.5 rounded-full border border-foil/30 bg-ink-950/40 px-4 py-2 text-[12px] text-ivory/70 backdrop-blur-md transition hover:border-foil/70 hover:text-foil-light"
        style={{ letterSpacing: '0.18em' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <rect x="3" y="5.5" width="18" height="13" rx="1" />
          <path d="M3.5 6.5l8.5 6.5 8.5-6.5" strokeLinejoin="round" />
        </svg>
        <span>
          <span className="hidden sm:inline">See your </span>invitation
        </span>
      </Link>
    </header>
  );
}

const stripDear = (s) => s.replace(/^Dear\s+/, '').replace(/,\s*$/, '');

export default function ThankYouPage() {
  // sealed → naming → opening (clip plays) → revealing (card rises) → card
  const [stage, setStage] = useState('sealed');
  const [guest, setGuest] = useState(null);
  const [letter, setLetter] = useState(null);
  const [gallery, setGallery] = useState({ open: false, start: null });
  const [prefill] = useState(recallGuest);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('night');
    const meta = document.querySelector('meta[name="theme-color"]');
    const prevTheme = meta?.getAttribute('content');
    meta?.setAttribute('content', '#0B0509');
    return () => {
      root.classList.remove('night');
      if (meta && prevTheme) meta.setAttribute('content', prevTheme);
    };
  }, []);

  const onSealClick = () => {
    setStage('naming');
    loadLetters();
  };

  const onGuestMatched = ({ person, displayName }) => {
    rememberGuest(displayName);
    setGuest({ person, displayName });
    loadLetters()
      .then((all) => setLetter(all[person.letter] || null))
      .catch(() => setLetter(null));
    setStage('opening');
    window.setTimeout(() => skyBurst(window.innerWidth / 2, window.innerHeight * 0.3, { palette: 'gold', count: 90, power: 1.15 }), 420);
  };

  const onClipNearEnd = useCallback(() => setStage((s) => (s === 'opening' ? 'revealing' : s)), []);

  useEffect(() => {
    if (stage !== 'revealing') return undefined;
    const burst = window.setTimeout(() => {
      skyBurst(window.innerWidth * 0.5, window.innerHeight * 0.2, { palette: 'mixed', count: 120, power: 1.35 });
      skyBurst(window.innerWidth * 0.22, window.innerHeight * 0.32, { palette: 'orchid', count: 60, power: 0.9 });
      skyBurst(window.innerWidth * 0.78, window.innerHeight * 0.28, { palette: 'gold', count: 60, power: 0.9 });
    }, 1100);
    const done = window.setTimeout(() => setStage('card'), 2100);
    return () => {
      window.clearTimeout(burst);
      window.clearTimeout(done);
    };
  }, [stage]);

  const showCard = stage === 'revealing' || stage === 'card';
  const envelopeOpen = stage === 'opening' || stage === 'revealing';
  const recipient = letter?.salutation ? stripDear(letter.salutation) : firstName(guest?.displayName);
  const openGallery = useCallback((start = null) => setGallery({ open: true, start }), []);
  const closeGallery = useCallback(() => setGallery({ open: false, start: null }), []);

  return (
    <div className="ty-page relative min-h-[100svh] overflow-hidden text-ivory">
      <GoldDefs />
      <NightBackground dim={showCard} />
      <SkyEffects ambientBursts={stage === 'card' && !gallery.open} />
      <FilmStrips show={stage === 'card'} photos={photos} onOpen={openGallery} />
      <TopBar />
      <BackgroundMusic src={THANK_YOU.musicSrc} startAt={THANK_YOU.musicStartAt} variant="night" />

      <main className="ty-stage pointer-events-none relative z-10 flex min-h-[100svh] items-center justify-center px-3">
        <div className="grid place-items-center">
          {showCard && (
            <motion.div
              className="pointer-events-auto relative z-30 [grid-area:1/1]"
              initial={{ y: 220, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.5, ease: EASE }}
            >
              <ThankYouCard
                recipient={recipient}
                letter={letter}
                hasPhotos={photos.length > 0}
                onOpenGallery={() => openGallery(null)}
              />
            </motion.div>
          )}

          {stage !== 'card' && (
            <motion.div
              className="pointer-events-auto relative z-20 [grid-area:1/1]"
              initial={{ opacity: 0, y: 24 }}
              animate={{
                opacity: stage === 'revealing' ? 0 : 1,
                y: stage === 'revealing' ? '70%' : envelopeOpen ? '22%' : 0,
                scale: stage === 'revealing' ? 0.86 : 1,
              }}
              transition={{
                opacity: { duration: stage === 'revealing' ? 0.9 : 0.9, delay: stage === 'revealing' ? 0.9 : 0.15 },
                y: { duration: stage === 'revealing' ? 1.5 : 1.0, ease: EASE, delay: envelopeOpen && stage !== 'revealing' ? 0.15 : 0 },
                scale: { duration: 1.5, ease: EASE },
              }}
            >
              <ThankYouEnvelope
                stage={stage}
                guestName={guest?.displayName}
                prefillName={prefill}
                onSealClick={onSealClick}
                onGuestMatched={onGuestMatched}
                onClipNearEnd={onClipNearEnd}
              />
            </motion.div>
          )}
        </div>
      </main>

      <PhotoGallery open={gallery.open} photos={photos} startIndex={gallery.start} onClose={closeGallery} />
    </div>
  );
}
