import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THANK_YOU } from '../config';

const EASE = [0.4, 0, 0.2, 1];
const SLIDE_MS = 5200;
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

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

function Lightbox({ photos, index, setIndex, onClose, playing, setPlaying }) {
  const photo = photos[index];
  const count = photos.length;
  const touch = useRef(null);
  const [dir, setDir] = useState(1);

  const go = useCallback(
    (step) => {
      setDir(step);
      setIndex((i) => (i + step + count) % count);
    },
    [count, setIndex],
  );

  // keyboard: arrows, space (slideshow), esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose, setPlaying]);

  // slideshow
  useEffect(() => {
    if (!playing || count < 2) return undefined;
    const t = window.setTimeout(() => go(1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [playing, index, go, count]);

  // warm the neighbours
  useEffect(() => {
    [index + 1, index - 1].forEach((i) => {
      const p = photos[(i + count) % count];
      if (p) new Image().src = p.lg;
    });
  }, [index, photos, count]);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) onClose();
  };

  const chevron = (d) => (
    <svg width="14" height="26" viewBox="0 0 14 26" aria-hidden="true">
      <path d={d} fill="none" stroke="#C9A961" strokeWidth="1" />
    </svg>
  );

  return (
    <motion.div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-ink-950/[0.985]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
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
          className="max-h-[calc(100dvh-132px)] max-w-[calc(100vw-24px)] select-none object-contain shadow-[0_30px_90px_rgba(0,0,0,0.7)] md:max-w-[calc(100vw-200px)]"
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

      <div className="absolute right-3 top-3 flex items-center gap-4 md:right-6 md:top-5">
        {count > 1 && (
          <button type="button" onClick={() => setPlaying((p) => !p)} className="ty-link min-h-[44px] text-[16px]">
            {playing ? 'Pause' : 'Slideshow'}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="ty-caps flex min-h-[44px] items-center px-1 text-[12px] lowercase text-ivory/70 transition hover:text-foil-light"
        >
          Close
        </button>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute left-1 top-1/2 hidden h-16 w-12 -translate-y-1/2 items-center justify-center opacity-70 transition hover:opacity-100 md:left-5 md:flex"
          >
            {chevron('M13 1L1 13l12 12')}
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute right-1 top-1/2 hidden h-16 w-12 -translate-y-1/2 items-center justify-center opacity-70 transition hover:opacity-100 md:right-5 md:flex"
          >
            {chevron('M1 1l12 12L1 25')}
          </button>
        </>
      )}

      <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center font-display text-[14px] italic text-ivory/50 md:bottom-5">
        {photo.alt ? `${photo.alt} · ` : ''}
        {index + 1} of {count} · Photography by {THANK_YOU.photographer}
        <span className="ty-caps mt-0.5 block text-[11px] not-italic text-ivory/30 md:hidden">swipe to browse</span>
      </p>
    </motion.div>
  );
}

/**
 * Full-screen gallery: the wedding photos in order (by chapter when set), a
 * lightbox and a slideshow. Opens straight into the lightbox when a
 * film-strip frame is tapped. The panel mounts fresh on every open.
 */
export function PhotoGallery({ open, photos, startIndex = null, onClose }) {
  return (
    <AnimatePresence>
      {open && <GalleryPanel key="gallery" photos={photos} startIndex={startIndex} onClose={onClose} />}
    </AnimatePresence>
  );
}

function GalleryPanel({ photos, startIndex, onClose }) {
  const [lightbox, setLightbox] = useState(startIndex);
  const [playing, setPlaying] = useState(false);
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
    const returnTo = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => panelRef.current?.focus(), 50);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      returnTo?.focus?.();
    };
  }, []);

  useEffect(() => {
    if (lightbox !== null) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, onClose]);

  const closeLightbox = useCallback(() => {
    setPlaying(false);
    setLightbox(null);
  }, []);

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
      <header className="relative px-4 pb-10 pt-16 text-center md:px-12 md:pt-14">
        <div className="absolute right-3 top-3 flex items-center gap-4 md:right-6 md:top-5">
          {photos.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setLightbox(0);
                setPlaying(true);
              }}
              className="ty-link min-h-[44px] text-[16px]"
            >
              Play slideshow
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="ty-caps flex min-h-[44px] items-center px-1 text-[12px] lowercase text-ivory/70 transition hover:text-foil-light"
          >
            Close
          </button>
        </div>
        <p className="ty-caps text-[12px] text-foil/80">Barcelona · September 2026</p>
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
                <p className="ty-caps text-[11px] text-foil/70">{ROMAN[named.indexOf(c)] || ''}</p>
                <h3 className="foil-text mx-auto w-fit px-[0.2em] font-script text-[40px] leading-[1.25] md:text-[46px]">{c.name}</h3>
                <span className="mx-auto mt-2 block h-px w-16 bg-gradient-to-r from-transparent via-foil/70 to-transparent" aria-hidden="true" />
              </div>
            )}
            <Grid items={c.items} photos={photos} onOpen={setLightbox} />
          </section>
        ))}
      </div>

      <footer className="pb-14 text-center">
        <div className="mx-auto mb-5 h-px w-24 bg-gradient-to-r from-transparent via-foil/50 to-transparent" />
        <p className="font-display text-[16px] italic text-ivory/60">Photography by {THANK_YOU.photographer}</p>
        {THANK_YOU.vogueUrl && (
          <a href={THANK_YOU.vogueUrl} target="_blank" rel="noopener noreferrer" className="ty-link mt-2 inline-block text-[16px]">
            Read our story in <span className="not-italic tracking-[0.14em]">VOGUE</span>
          </a>
        )}
        <p className="ty-caps mt-2 text-[11px] text-ivory/35">{THANK_YOU.hashtag}</p>
      </footer>

      <AnimatePresence>
        {lightbox !== null && photos[lightbox] && (
          <Lightbox key="lightbox" photos={photos} index={lightbox} setIndex={setLightbox} onClose={closeLightbox} playing={playing} setPlaying={setPlaying} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
