import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { NightBackground } from './components/NightBackground';
import { SkyEffects } from './components/SkyEffects';
import { EnvelopePocket, ThankYouEnvelope } from './components/ThankYouEnvelope';
import { ThankYouCard } from './components/ThankYouCard';
import { FilmStrips } from './components/FilmStrips';
import { PhotoGallery } from './components/PhotoGallery';
import { BackgroundMusic } from '../components/BackgroundMusic';
import { greetingName, recallGuest, recallGuestRecord, rememberGuest, resolveGuest } from '../lib/guests';
import { skyBurst } from './sky';
import { currentLayer, leaveLayers, leaveStaleLayers, newLayerToken, pushLayer } from './layers';
import { THANK_YOU } from './config';
import { NO_PEOPLE, loadPeople, loadPhotos, yourPhotos } from './photos';
import lettersUrl from './data/letters.json?url';

const EASE = [0.4, 0, 0.2, 1];
const PULL = [0.22, 1, 0.36, 1];

// The card slides out of the envelope: rises behind the pocket, pauses
// part-way out, then settles while the envelope drops away.
const REVEAL = { delay: 0.5, duration: 2.8, times: [0, 0.42, 0.55, 1], ease: PULL };
const REVEAL_MS = 3400;

// How dark (and how soft) the night photo sits behind each stage
const DIM = { sealed: 0.12, naming: 0.3, opening: 0.62, revealing: 0.5, card: 0.45 };

// Letters are a separate file, fetched only once someone opens the envelope.
// A failed fetch is forgotten, so the next attempt really tries again.
let lettersPromise;
const loadLetters = () =>
  (lettersPromise ||= fetch(lettersUrl)
    .then((r) => {
      if (!r.ok) throw new Error(`letters: HTTP ${r.status}`);
      return r.json();
    })
    .catch((err) => {
      lettersPromise = undefined;
      throw err;
    }));

const GALLERY_CLOSED = { open: false, start: null, token: null };
const NO_PHOTOS = { status: 'idle', all: [], featured: [], people: NO_PEOPLE };

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
  // A guest who has opened their card on this device before goes straight back to it
  const [returning] = useState(() => {
    const record = recallGuestRecord();
    const m = resolveGuest(record.name);
    return m.status === 'exact' ? { ...m, names: record.names } : null;
  });
  // A name remembered from an earlier visit that no longer matches exactly is
  // offered back; reopening the envelope starts blank, so it doubles as "not you?"
  const [prefill] = useState(() => (returning ? '' : recallGuest()));
  // sealed → naming → opening (clip plays) → revealing (card slides out) → card
  const [stage, setStage] = useState(returning ? 'card' : 'sealed');
  const [guest, setGuest] = useState(returning ? { person: returning.person, displayName: returning.displayName } : null);
  const [letter, setLetter] = useState({ status: returning ? 'loading' : 'idle', value: null });
  const [face, setFace] = useState('front');
  const [gallery, setGallery] = useState(GALLERY_CLOSED);
  const [photos, setPhotos] = useState(NO_PHOTOS);
  const stageRef = useRef(stage);
  const letterRequest = useRef(0);
  const letterFailures = useRef(0);
  const photoRetries = useRef(0); // presses of the gallery's Try again

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

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

  // Only the newest request may set the letter (a retry, or a different name)
  const requestLetter = useCallback((person) => {
    const id = ++letterRequest.current;
    loadLetters().then(
      (all) => {
        if (id !== letterRequest.current) return;
        const value = all[person.letter];
        setLetter(value ? { status: 'ready', value } : { status: 'failed', value: null });
      },
      () => {
        if (id !== letterRequest.current) return;
        letterFailures.current += 1;
        setLetter({ status: 'failed', value: null });
      },
    );
  }, []);

  useEffect(() => {
    if (returning) requestLetter(returning.person);
  }, [returning, requestLetter]);

  const retryLetter = useCallback(() => {
    if (!guest) return;
    // After a second failure or a long stall (say the site was redeployed while
    // this tab was open), a fresh load is the sure fix. The guest is remembered,
    // so it comes straight back to the card.
    if (letterFailures.current >= 2 || letter.status === 'loading') {
      window.location.reload();
      return;
    }
    setLetter({ status: 'loading', value: null });
    requestLetter(guest.person);
  }, [guest, letter.status, requestLetter]);

  // The photo list comes once the card is out (the photos themselves only as
  // they are looked at), with the list of who is in which. If it fails, it's
  // asked for again when the gallery opens or the connection comes back.
  const requestPhotos = useCallback(() => {
    Promise.all([loadPhotos(), loadPeople()]).then(
      ([all, people]) => setPhotos({ status: 'ready', all, featured: all.filter((ph) => ph.featured), people }),
      () => setPhotos((p) => ({ ...p, status: 'failed' })),
    );
  }, []);
  // Try again asks once more; pressed a second time it reloads the page (the
  // site may have been updated since it was opened, so the old list is gone)
  const retryPhotos = useCallback(() => {
    photoRetries.current += 1;
    if (photoRetries.current >= 2) {
      window.location.reload();
      return;
    }
    setPhotos((p) => ({ ...p, status: 'loading' }));
    requestPhotos();
  }, [requestPhotos]);

  const onSealClick = () => {
    if (stageRef.current !== 'sealed') return;
    stageRef.current = 'naming';
    setStage('naming');
    loadLetters().catch(() => {}); // warm it; a failure is retried on submit
  };

  const onGuestMatched = ({ person, displayName }) => {
    // accept once, even if a stale button (still fading out) is tapped again
    if (stageRef.current !== 'naming') return;
    stageRef.current = 'opening';
    rememberGuest(displayName);
    setGuest({ person, displayName });
    setLetter({ status: 'loading', value: null });
    requestLetter(person);
    setStage('opening');
  };

  const onClipNearEnd = useCallback(() => setStage((s) => (s === 'opening' ? 'revealing' : s)), []);

  const reopenEnvelope = () => {
    stageRef.current = 'sealed';
    setFace('front');
    setStage('sealed');
  };

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

  // a failed list is asked for again when the connection comes back
  const photosFailed = photos.status === 'failed';
  const photosFailedRef = useRef(false);
  useEffect(() => {
    photosFailedRef.current = photosFailed;
    if (!photosFailed) return undefined;
    const again = () => requestPhotos();
    window.addEventListener('online', again);
    return () => window.removeEventListener('online', again);
  }, [photosFailed, requestPhotos]);

  // The gallery gets a history entry, so Back closes it rather than the site.
  // If the browser still sits on an old entry, step back to the page's own
  // first, then open.
  const pendingOpen = useRef(null);
  const openGallery = useCallback(
    (start = null) => {
      if (currentLayer()) {
        pendingOpen.current = { start };
        leaveStaleLayers();
        return;
      }
      const token = newLayerToken();
      pushLayer({ ty: 'gallery', token, depth: 1, start });
      setGallery({ open: true, start, token });
      window.dispatchEvent(new Event('film-pause')); // the card's film doesn't play on behind the photos
      if (photosFailedRef.current) requestPhotos(); // the list failed earlier: try once more now
    },
    [requestPhotos],
  );
  const closeGallery = useCallback(() => {
    if (!leaveLayers(gallery.token)) setGallery(GALLERY_CLOSED);
  }, [gallery.token]);
  // Back and Forward: the history entry says whether the gallery is open
  useEffect(() => {
    leaveStaleLayers();
    const onPop = () => {
      const layer = currentLayer();
      if (!layer) {
        setGallery((g) => (g.open ? GALLERY_CLOSED : g));
        const p = pendingOpen.current;
        pendingOpen.current = null;
        if (p) openGallery(p.start);
        return;
      }
      // a gallery entry while the envelope is showing: back to the page's own
      if (stageRef.current !== 'card') {
        leaveStaleLayers();
        return;
      }
      setGallery((g) => (g.open && g.token === layer.token ? g : { open: true, start: layer.ty === 'gallery' ? layer.start : null, token: layer.token }));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [openGallery]);

  // A returning guest's card shows before their letter has loaded. The names
  // line remembered from last time stands in; without one, the line is held
  // back for a moment so it doesn't change on screen.
  const [holdDone, setHoldDone] = useState(!returning || !!returning.names);
  useEffect(() => {
    if (holdDone) return undefined;
    const t = window.setTimeout(() => setHoldDone(true), 1500);
    return () => window.clearTimeout(t);
  }, [holdDone]);
  const recipientPending = !holdDone && letter.status === 'loading';
  useEffect(() => {
    if (letter.status === 'ready' && guest && letter.value?.salutation) rememberGuest(guest.displayName, stripDear(letter.value.salutation));
  }, [letter, guest]);

  const revealing = stage === 'revealing';
  const atCard = stage === 'card';
  const showCard = revealing || atCard;
  const photosAsked = useRef(false);
  useEffect(() => {
    if (!showCard || photosAsked.current) return;
    photosAsked.current = true;
    requestPhotos();
  }, [showCard, requestPhotos]);
  const envelopeOpen = stage === 'opening' || revealing;
  // the gallery's Your Photos tab: their household's photos, if they are in one
  const mine = guest ? yourPhotos(photos.people, guest.person) : null;
  const greet = guest ? greetingName(guest.person, guest.displayName) : '';
  const rememberedNames = returning?.names && guest?.displayName === returning.displayName && letter.status === 'loading' ? returning.names : '';
  const recipient = letter.value?.salutation ? stripDear(letter.value.salutation) : rememberedNames || greet;

  const envelopeAnimate = revealing
    ? { y: ['22%', '45%', '45%', '140%'], opacity: [1, 1, 1, 0] }
    : { y: envelopeOpen ? '22%' : 0, opacity: 1 };
  const envelopeTransition = revealing ? REVEAL : { duration: 1.0, ease: EASE, delay: envelopeOpen ? 0.15 : 0 };

  return (
    <MotionConfig reducedMotion="user">
      <div className="ty-page relative min-h-[calc(100*var(--vh))] text-ivory" data-stage={stage}>
        <GoldDefs />
        {/* asks for the script font early, so "Dear …," never swaps fonts on screen */}
        <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 font-script opacity-0">
          Dear
        </span>
        <NightBackground dim={DIM[stage]} soft={stage !== 'sealed' && stage !== 'naming'} />
        <SkyEffects petals={stage === 'sealed' || stage === 'naming'} />

        {/* everything behind the gallery goes inert while it is open */}
        <div inert={gallery.open}>
          {/* quiet chrome: sound (from BackgroundMusic) on the left, invitation on the right */}
          <AnimatePresence>
            {atCard && (
              <motion.div
                key="invite-link"
                className="absolute right-3 top-3 z-[25] md:right-6 md:top-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.2, duration: 1 }}
              >
                <Link to="/invitation" className="ty-link inline-flex min-h-[44px] items-center px-2 text-[16px]">
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
                  className={`relative z-30 [grid-area:1/1] ${atCard ? 'pointer-events-auto' : 'pointer-events-none'}`}
                  initial={revealing ? { y: '16%', scale: 0.7, opacity: 0 } : { y: '3%', scale: 0.985, opacity: 0 }}
                  animate={revealing ? { y: ['16%', '-26%', '-26%', '0%'], scale: [0.7, 0.7, 0.7, 1], opacity: 1 } : { y: '0%', scale: 1, opacity: 1 }}
                  transition={revealing ? { ...REVEAL, opacity: { delay: 0.5, duration: 0.01 } } : { duration: 1.2, delay: 0.15, ease: EASE }}
                >
                  <ThankYouCard
                    recipient={recipient}
                    recipientPending={recipientPending}
                    letter={letter.value}
                    letterStatus={letter.status}
                    onRetryLetter={retryLetter}
                    hasPhotos
                    onOpenGallery={() => openGallery(null)}
                    onFaceChange={setFace}
                  />
                </motion.div>
              )}

              {!atCard && (
                <motion.div
                  className="pointer-events-auto relative z-20 [grid-area:1/1]"
                  initial={{ opacity: 0, y: 24 }}
                  animate={envelopeAnimate}
                  transition={envelopeTransition}
                >
                  <ThankYouEnvelope
                    stage={stage}
                    guestName={greet}
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

          {/* film strips come after the card in reading order; they repeat the gallery */}
          <FilmStrips show={atCard} quiet={face === 'back' || gallery.open} photos={photos.featured} onOpen={openGallery} />

          {/* always under the card, so anyone can watch the envelope open again
              (or, on a shared phone, open it under their own name) */}
          <AnimatePresence>
            {atCard && (
              <motion.div
                key="reopen"
                className="ty-reopen absolute inset-x-0 z-[25] flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.6, duration: 1 }}
              >
                <button type="button" onClick={reopenEnvelope} className="ty-link inline-flex min-h-[44px] items-center px-2 text-[16px]">
                  Open the envelope again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PhotoGallery
          open={gallery.open}
          photos={photos.all}
          mine={mine}
          status={photos.status === 'ready' ? 'ready' : photos.status === 'failed' ? 'failed' : 'loading'}
          onRetry={retryPhotos}
          startIndex={gallery.start}
          token={gallery.token}
          onClose={closeGallery}
        />
      </div>
    </MotionConfig>
  );
}
