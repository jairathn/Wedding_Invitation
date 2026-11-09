import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useIsPresent } from 'framer-motion';
import { THANK_YOU } from '../config';
import { layerState, popLayer, pushLayer } from '../layers';

const EASE = [0.4, 0, 0.2, 1];
const SLIDE_MS = 5200;
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const tracked = (em) => ({ letterSpacing: `${em}em`, textIndent: `${em}em` });
const BACK_ARROW = (
  <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden="true">
    <path d="M16 4H1.5M4.5 1L1.5 4l3 3" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);

function Thumb({ photo, index, onOpen }) {
  const [loaded, setLoaded] = useState(false);
  const landscape = photo.w > photo.h;
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(index)}
      className={`group relative block w-full self-start overflow-hidden bg-ink-800 focus:outline-none focus-visible:ring-1 focus-visible:ring-foil-light focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950 ${landscape ? 'col-span-2' : ''}`}
      style={{ aspectRatio: landscape ? '4 / 3' : '2 / 3' }}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '120px' }}
      transition={{ duration: 0.8, ease: EASE, delay: (index % 4) * 0.05 }}
      aria-label={photo.alt ? `View photo: ${photo.alt}` : `View photo ${index + 1}`}
    >
      <img
        src={photo.md}
        alt={photo.alt || ''}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className="h-full w-full object-cover transition duration-[900ms] ease-out group-hover:brightness-[1.08]"
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </motion.button>
  );
}

function Grid({ items, photos, onOpen }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-8 md:gap-y-10 xl:grid-cols-4">
      {items.map((p) => (
        <Thumb key={p.id} photo={p} index={photos.indexOf(p)} onOpen={onOpen} />
      ))}
    </div>
  );
}

function Lightbox({ photos, index, setIndex, onClose, playing, setPlaying, direct, onShowAll }) {
  const photo = photos[index];
  const count = photos.length;
  const isPresent = useIsPresent(); // false while it fades out: no keys or slideshow ticks then
  const rootRef = useRef(null);
  const touch = useRef(null);
  const pinch = useRef(false);
  const [returnTo] = useState(() => document.activeElement);
  const [dir, setDir] = useState(1);

  const go = useCallback(
    (step) => {
      setDir(step);
      setIndex((i) => (i === null ? null : (i + step + count) % count));
    },
    [count, setIndex],
  );

  // focus moves into the viewer, and back to the photo it came from on close
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
    return () => {
      if (returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, [returnTo]);

  // keyboard: arrows, space (slideshow, unless a button has focus), esc
  useEffect(() => {
    if (!isPresent) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Escape') onClose();
      else if (e.key === ' ' && !e.target.closest?.('button, a')) {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPresent, go, onClose, setPlaying]);

  // slideshow
  useEffect(() => {
    if (!isPresent || !playing || count < 2) return undefined;
    const t = window.setTimeout(() => go(1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [isPresent, playing, index, go, count]);

  // warm the neighbours
  useEffect(() => {
    [index + 1, index - 1].forEach((i) => {
      const p = photos[(i + count) % count];
      if (p) new Image().src = p.lg;
    });
  }, [index, photos, count]);

  // one-finger swipes browse (down closes); pinches and zoomed views are left alone
  const onTouchStart = (e) => {
    if (e.touches.length > 1) {
      pinch.current = true;
      touch.current = null;
      return;
    }
    if (pinch.current) return;
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (pinch.current) {
      if (e.touches.length === 0) pinch.current = false;
      return;
    }
    const start = touch.current;
    touch.current = null;
    if (!start || (window.visualViewport?.scale ?? 1) > 1.01) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) onClose();
  };

  const chevron = (d) => (
    <svg width="12" height="22" viewBox="0 0 14 26" aria-hidden="true">
      <path d={d} fill="none" stroke="#C9A961" strokeWidth="1.2" />
    </svg>
  );
  const arrow =
    'absolute bottom-[max(12px,env(safe-area-inset-bottom))] flex h-12 w-12 items-center justify-center rounded-full border border-ivory/20 bg-ink-950/80 opacity-90 transition hover:opacity-100 focus-visible:border-foil-light focus-visible:outline-none md:bottom-auto md:top-1/2 md:h-16 md:-translate-y-1/2 md:rounded-none md:border-0 md:bg-transparent';

  return (
    <motion.div
      ref={rootRef}
      tabIndex={-1}
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-ink-950 focus:outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // a tap on the dark surround closes
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${count}`}
    >
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.img
          key={photo.id}
          src={photo.lg}
          alt={photo.alt || ''}
          custom={dir}
          className="max-h-[calc(100dvh-148px)] max-w-[calc(100vw-24px)] select-none object-contain shadow-[0_30px_90px_rgba(0,0,0,0.7)] md:max-h-[calc(100dvh-132px)] md:max-w-[calc(100vw-200px)]"
          style={{ aspectRatio: `${photo.w} / ${photo.h}` }}
          draggable={false}
          variants={{
            enter: (d) => ({ opacity: 0, x: playing ? 0 : d * 60, scale: playing ? 1.04 : 1 }),
            center: { opacity: 1, x: 0, scale: 1 },
            exit: (d) => ({ opacity: 0, x: playing ? 0 : d * -60 }),
          }}
          initial="enter"
          animate={playing ? { opacity: 1, x: 0, scale: [1, 1.05] } : 'center'}
          exit="exit"
          transition={playing ? { opacity: { duration: 1.1 }, scale: { duration: SLIDE_MS / 1000 + 1.2, ease: 'linear' } } : { duration: 0.45, ease: EASE }}
        />
      </AnimatePresence>

      {direct && (
        <div className="absolute left-3 top-3 md:left-6 md:top-5">
          <button type="button" onClick={onShowAll} className="ty-link inline-flex min-h-[44px] items-center px-1 text-[16px]">
            All photographs
          </button>
        </div>
      )}
      <div className="absolute right-3 top-3 flex items-center gap-3 md:right-6 md:top-5 md:gap-5">
        {count > 1 && (
          <button type="button" onClick={() => setPlaying((p) => !p)} className="ty-link inline-flex min-h-[44px] items-center px-1 text-[16px]">
            {playing ? 'Pause' : 'Slideshow'}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="ty-caps inline-flex min-h-[44px] items-center px-1 text-ivory/85 transition hover:text-foil-light focus-visible:text-foil-light focus-visible:outline-none"
          style={{ fontSize: '14px', ...tracked(0.16) }}
        >
          Close
        </button>
      </div>

      {count > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={`${arrow} left-3 md:left-5`}>
            {chevron('M13 1L1 13l12 12')}
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next photo" className={`${arrow} right-3 md:right-5`}>
            {chevron('M1 1l12 12L1 25')}
          </button>
        </>
      )}

      <p className="pointer-events-none absolute inset-x-[68px] bottom-[max(12px,env(safe-area-inset-bottom))] flex min-h-12 items-center justify-center text-center font-display text-[15px] italic leading-snug text-ivory/75 md:inset-x-0 md:bottom-5 md:min-h-0">
        <span>
          {photo.alt ? `${photo.alt} · ` : ''}
          {index + 1} of {count} · Photography by {THANK_YOU.photographer}
        </span>
      </p>
    </motion.div>
  );
}

/**
 * Full-screen gallery: the wedding photos in order (by chapter when set), a
 * lightbox and a slideshow. A film-strip frame opens straight into that
 * photo, and closing it goes straight back to the card. The panel mounts
 * fresh on every open.
 */
export function PhotoGallery({ open, photos, startIndex = null, token = null, onClose }) {
  return (
    <AnimatePresence>
      {open && <GalleryPanel key={token || 'gallery'} photos={photos} startIndex={startIndex} token={token} onClose={onClose} />}
    </AnimatePresence>
  );
}

function GalleryPanel({ photos, startIndex, token, onClose }) {
  const [lightbox, setLightbox] = useState(startIndex);
  const [direct, setDirect] = useState(startIndex !== null);
  const [playing, setPlaying] = useState(false);
  const [returnTo] = useState(() => document.activeElement);
  const panelRef = useRef(null);

  const chapters = useMemo(() => {
    const order = [];
    const byName = new Map();
    for (const p of photos) {
      const name = p.chapter || null;
      if (!byName.has(name)) {
        byName.set(name, []);
        order.push(name);
      }
      byName.get(name).push(p);
    }
    return order.map((name) => ({ name, items: byName.get(name) }));
  }, [photos]);
  const named = chapters.filter((c) => c.name);

  // lock page scroll, move focus in, and give it back on close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => {
      if (!panelRef.current?.contains(document.activeElement)) panelRef.current?.focus({ preventScroll: true });
    }, 50);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      if (!returnTo || returnTo === document.body) return;
      // the button that opened it may have gone (the card turned over meanwhile)
      const target = returnTo.isConnected ? returnTo : document.querySelector('.ty-card [data-read], .ty-card [data-turn]');
      target?.focus?.({ preventScroll: true });
    };
  }, [returnTo]);

  useEffect(() => {
    if (lightbox !== null) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, onClose]);

  // A photo opened from the grid has its own history entry: Back returns to the grid
  const openPhoto = useCallback(
    (i) => {
      pushLayer('photo', token);
      setLightbox(i);
    },
    [token],
  );
  const closeLightbox = useCallback(() => {
    setPlaying(false);
    if (direct) {
      onClose(); // opened from the film strip: straight back to the card
      return;
    }
    if (!popLayer('photo', token)) setLightbox(null);
  }, [direct, onClose, token]);
  const showAll = useCallback(() => {
    setPlaying(false);
    setDirect(false);
    setLightbox(null);
  }, []);
  useEffect(() => {
    const onPop = () => {
      const s = layerState();
      if (s.token === token && s.ty === 'gallery') {
        setPlaying(false);
        setLightbox(null);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [token]);

  const backButton = (extra = '') => (
    <button
      type="button"
      onClick={onClose}
      className={`ty-caps pointer-events-auto inline-flex min-h-[44px] items-center gap-2.5 px-1 text-ivory/85 transition hover:text-foil-light focus-visible:text-foil-light focus-visible:outline-none ${extra}`}
      style={{ fontSize: '14px', ...tracked(0.16) }}
    >
      {BACK_ARROW}
      Back to your card
    </button>
  );

  return (
    <motion.div
      ref={panelRef}
      tabIndex={-1}
      className="fixed inset-0 z-[10000] overflow-y-auto overscroll-contain focus:outline-none"
      style={{ background: 'radial-gradient(90% 55% at 50% 0%, rgba(79,31,85,0.32) 0%, rgba(10,8,7,0) 62%), radial-gradient(60% 40% at 50% 0%, rgba(201,169,97,0.08) 0%, rgba(10,8,7,0) 70%), #0A0807' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      role="dialog"
      aria-modal="true"
      aria-label="Our wedding photos"
    >
      <div inert={lightbox !== null}>
        {/* stays at the top while the photos scroll by */}
        <div
          className="pointer-events-none sticky top-0 z-20 flex items-center justify-between gap-4 px-3 pb-7 pt-3 md:px-6 md:pt-5"
          style={{ background: 'linear-gradient(180deg, #0A0807 0%, rgba(10,8,7,0.9) 58%, rgba(10,8,7,0) 100%)' }}
        >
          {backButton()}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={() => {
                openPhoto(0);
                setPlaying(true);
              }}
              className="ty-link pointer-events-auto inline-flex min-h-[44px] items-center px-1 text-[16px]"
            >
              Play slideshow
            </button>
          )}
        </div>

        <header className="px-4 pb-10 pt-1 text-center md:px-12">
          <p className="ty-caps text-[13px] text-foil/85" style={tracked(0.2)}>
            Barcelona · September 2026
          </p>
          <h2 className="foil-text mx-auto mt-1 w-fit px-[0.2em] font-script text-[52px] leading-[1.2] md:text-[72px]">Our Wedding</h2>
          <div className="mx-auto mt-3 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-foil/60" />
            <span className="h-[5px] w-[5px] rotate-45 bg-foil/80" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-foil/60" />
          </div>
        </header>

        <div className="mx-auto max-w-[1180px] px-4 pb-20 md:px-12">
          {chapters.map((c) => (
            <section key={c.name || 'all'} className={c.name ? 'pt-6' : ''} aria-label={c.name || undefined}>
              {c.name && named.length > 1 && (
                <div className="py-12 text-center md:py-16">
                  <p className="ty-caps text-[13px] text-foil/80" style={tracked(0.2)}>
                    {ROMAN[named.indexOf(c)] || ''}
                  </p>
                  <h3 className="foil-text mx-auto w-fit px-[0.2em] font-script text-[40px] leading-[1.25] md:text-[46px]">{c.name}</h3>
                  <span className="mx-auto mt-2 block h-px w-16 bg-gradient-to-r from-transparent via-foil/70 to-transparent" aria-hidden="true" />
                </div>
              )}
              <Grid items={c.items} photos={photos} onOpen={openPhoto} />
            </section>
          ))}
        </div>

        <footer className="flex flex-col items-center pb-[max(56px,calc(env(safe-area-inset-bottom)+32px))] text-center">
          <div className="mb-5 h-px w-24 bg-gradient-to-r from-transparent via-foil/50 to-transparent" />
          <p className="font-display text-[16px] italic text-ivory/70">Photography by {THANK_YOU.photographer}</p>
          {THANK_YOU.vogueUrl && (
            <a href={THANK_YOU.vogueUrl} target="_blank" rel="noopener noreferrer" className="ty-link mt-1 inline-flex min-h-[44px] items-center text-[16px]">
              Read our story in <span className="not-italic tracking-[0.14em]">&nbsp;VOGUE</span>
            </a>
          )}
          <p className="ty-caps mt-2 text-[13px] text-ivory/55" style={tracked(0.16)}>
            {THANK_YOU.hashtag}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="ty-caps mt-9 inline-flex min-h-[48px] items-center gap-3 border border-foil/55 bg-foil/[0.06] px-7 font-semibold text-foil-light transition hover:border-foil hover:bg-foil/[0.14] focus-visible:border-foil focus-visible:outline-none"
            style={{ fontSize: '14px', ...tracked(0.16) }}
          >
            {BACK_ARROW}
            Back to your card
          </button>
        </footer>
      </div>

      <AnimatePresence>
        {lightbox !== null && photos[lightbox] && (
          <Lightbox
            key="lightbox"
            photos={photos}
            index={lightbox}
            setIndex={setLightbox}
            onClose={closeLightbox}
            playing={playing}
            setPlaying={setPlaying}
            direct={direct}
            onShowAll={showAll}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
