import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { NightBackground } from './components/NightBackground';
import { SkyEffects } from './components/SkyEffects';
import { EnvelopePocket, ThankYouEnvelope } from './components/ThankYouEnvelope';
import { ThankYouCard } from './components/ThankYouCard';
import { FilmStrips } from './components/FilmStrips';
import { PhotoGallery } from './components/PhotoGallery';
import { BackgroundMusic } from '../components/BackgroundMusic';
import { firstName, recallGuest, rememberGuest } from '../lib/guests';
import { skyBurst } from './sky';
import { THANK_YOU } from './config';
import photoManifest from './data/photos.json';

const EASE = [0.4, 0, 0.2, 1];
const PULL = [0.22, 1, 0.36, 1];
const photos = photoManifest.photos;

// The card slides out of the envelope: rises behind the pocket, pauses
// part-way out, then settles while the envelope drops away.
const REVEAL = { delay: 0.5, duration: 2.8, times: [0, 0.42, 0.55, 1], ease: PULL };
const REVEAL_MS = 3400;

// How dark (and how soft) the night photo sits behind each stage
const DIM = { sealed: 0.12, naming: 0.3, opening: 0.62, revealing: 0.5, card: 0.45 };

// Letters load in their own small chunk, only once someone opens the envelope
let lettersPromise;
const loadLetters = () => (lettersPromise ||= import('./data/letters.json').then((m) => m.default));

/** Shared gold gradient referenced by the card's SVG ornaments. */
function GoldDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ty-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F1DFB0" />
          <stop offset="50%" stopColor="#C9A961" />
          <stop offset="100%" stopColor="#8C6A2F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const stripDear = (s) => s.replace(/^Dear\s+/, '').replace(/,\s*$/, '');

export default function ThankYouPage() {
  // sealed → naming → opening (clip plays) → revealing (card slides out) → card
  const [stage, setStage] = useState('sealed');
  const [guest, setGuest] = useState(null);
  const [letter, setLetter] = useState(null);
  const [face, setFace] = useState('front');
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
    setStage((s) => (s === 'sealed' ? 'naming' : s));
    loadLetters();
  };

  const onGuestMatched = ({ person, displayName }) => {
    if (stage !== 'naming') return;
    rememberGuest(displayName);
    setGuest({ person, displayName });
    loadLetters()
      .then((all) => setLetter(all[person.letter] || null))
      .catch(() => setLetter(null));
    setStage('opening');
  };

  const onClipNearEnd = useCallback(() => setStage((s) => (s === 'opening' ? 'revealing' : s)), []);

  useEffect(() => {
    if (stage !== 'revealing') return undefined;
    const burst = window.setTimeout(() => {
      skyBurst(window.innerWidth * 0.5, window.innerHeight * 0.17, { palette: 'gold', count: 110, power: 1.25 });
    }, 1700);
    const done = window.setTimeout(() => setStage('card'), REVEAL_MS);
    return () => {
      window.clearTimeout(burst);
      window.clearTimeout(done);
    };
  }, [stage]);

  const revealing = stage === 'revealing';
  const showCard = revealing || stage === 'card';
  const envelopeOpen = stage === 'opening' || revealing;
  const recipient = letter?.salutation ? stripDear(letter.salutation) : firstName(guest?.displayName);
  const openGallery = useCallback((start = null) => setGallery({ open: true, start }), []);
  const closeGallery = useCallback(() => setGallery({ open: false, start: null }), []);

  const envelopeAnimate = revealing
    ? { y: ['22%', '45%', '45%', '140%'], opacity: [1, 1, 1, 0] }
    : { y: envelopeOpen ? '22%' : 0, opacity: 1 };
  const envelopeTransition = revealing ? REVEAL : { duration: 1.0, ease: EASE, delay: envelopeOpen ? 0.15 : 0 };

  return (
    <MotionConfig reducedMotion="user">
      <div className="ty-page relative min-h-[calc(100*var(--vh))] overflow-hidden text-ivory">
        <GoldDefs />
        <NightBackground dim={DIM[stage]} soft={stage !== 'sealed' && stage !== 'naming'} />
        <SkyEffects petals={stage === 'sealed' || stage === 'naming'} />
        <FilmStrips show={stage === 'card'} quiet={face === 'back' || gallery.open} photos={photos} onOpen={openGallery} />

        {/* quiet chrome: sound (from BackgroundMusic) on the left, invitation on the right */}
        <AnimatePresence>
          {stage === 'card' && (
            <motion.div
              key="invite-link"
              className="fixed right-4 top-4 z-[25] md:right-7 md:top-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2, duration: 1 }}
            >
              <Link to="/invitation" className="ty-link text-[16px] text-ivory/65">
                Your invitation
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <BackgroundMusic src={THANK_YOU.musicSrc} startAt={THANK_YOU.musicStartAt} variant="night" />

        <main className="ty-stage pointer-events-none relative z-10 flex min-h-[calc(100*var(--vh))] items-center justify-center">
          <div className="grid place-items-center">
            {showCard && (
              <motion.div
                className="pointer-events-auto relative z-30 [grid-area:1/1]"
                initial={{ y: '16%', scale: 0.7, opacity: 0 }}
                animate={revealing ? { y: ['16%', '-26%', '-26%', '0%'], scale: [0.7, 0.7, 0.7, 1], opacity: 1 } : { y: '0%', scale: 1, opacity: 1 }}
                transition={{ ...REVEAL, opacity: { delay: 0.5, duration: 0.01 } }}
              >
                <ThankYouCard recipient={recipient} letter={letter} hasPhotos={photos.length > 0} onOpenGallery={() => openGallery(null)} onFaceChange={setFace} />
              </motion.div>
            )}

            {stage !== 'card' && (
              <motion.div
                className="pointer-events-auto relative z-20 [grid-area:1/1]"
                initial={{ opacity: 0, y: 24 }}
                animate={envelopeAnimate}
                transition={envelopeTransition}
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

            {/* the envelope's back panel, in front of the card while it slides out */}
            {revealing && (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none relative z-40 [grid-area:1/1]"
                initial={{ opacity: 0, y: '22%' }}
                animate={{ opacity: [0, 1, 1, 0], y: ['22%', '45%', '45%', '140%'] }}
                transition={{ y: REVEAL, opacity: { duration: 3.3, times: [0, 0.15, 0.8, 1] } }}
              >
                <EnvelopePocket />
              </motion.div>
            )}
          </div>
        </main>

        <PhotoGallery open={gallery.open} photos={photos} startIndex={gallery.start} onClose={closeGallery} />
      </div>
    </MotionConfig>
  );
}
