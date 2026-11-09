import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THANK_YOU } from '../config';

const EASE = [0.4, 0, 0.2, 1];
const SLIDE_MS = 5200;

function Thumb({ photo, index, onOpen }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(index)}
      className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-[3px] bg-night-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 md:mb-4"
      style={{ aspectRatio: `${photo.w} / ${photo.h}` }}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '120px' }}
      transition={{ duration: 0.7, ease: EASE, delay: (index % 4) * 0.06 }}
      aria-label={photo.alt ? `View photo: ${photo.alt}` : `View photo ${index + 1}`}
    >
      <img
        src={photo.md}
        alt={photo.alt || ''}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className="h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-[1.03]"
        style={{ opacity: loaded ? 1 : 0, filter: loaded ? 'blur(0)' : 'blur(12px)' }}
      />
      <span className="pointer-events-none absolute inset-0 rounded-[3px] shadow-[inset_0_0_0_1px_rgba(232,194,122,0.12)] transition group-hover:shadow-[inset_0_0_0_1px_rgba(232,194,122,0.5)]" aria-hidden="true" />
    </motion.button>
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
          className="max-h-[calc(100dvh-120px)] max-w-[calc(100vw-24px)] select-none rounded-[2px] object-contain shadow-[0_30px_90px_rgba(0,0,0,0.7)] md:max-w-[calc(100vw-180px)]"
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

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between py-3 pl-16 pr-4 md:pl-20 md:pr-6">
        <p className="ty-caps text-[13px] text-ivory/60">
          {index + 1} <span className="mx-1 text-foil/70">/</span> {count}
        </p>
        <div className="pointer-events-auto flex items-center gap-2">
          {count > 1 && (
            <button type="button" onClick={() => setPlaying((p) => !p)} className="ty-link text-[16px]">
              {playing ? 'Pause' : 'Slideshow'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 text-ivory/80 transition hover:border-gold-300 hover:text-gold-300"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/15 bg-night-900/40 text-ivory/80 backdrop-blur transition hover:border-gold-300 hover:text-gold-300 md:left-6 md:flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/15 bg-night-900/40 text-ivory/80 backdrop-blur transition hover:border-gold-300 hover:text-gold-300 md:right-6 md:flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </>
      )}

      <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center font-display text-[13px] italic text-ivory/45 md:bottom-5">
        {photo.alt || <>Photography by {THANK_YOU.photographer}</>}
        <span className="ty-caps block text-[11px] not-italic text-ivory/30 md:hidden">swipe to browse</span>
      </p>
    </motion.div>
  );
}

/**
 * Full-screen gallery: a masonry wall of the wedding photos, a lightbox, and
 * a slideshow. Opens straight into the lightbox when a film-strip frame is
 * tapped. The panel mounts fresh on every open, so it starts from props.
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
  const [chapter, setChapter] = useState('all');
  const panelRef = useRef(null);

  const chapters = useMemo(() => {
    const seen = [];
    for (const p of photos) if (p.chapter && !seen.includes(p.chapter)) seen.push(p.chapter);
    return seen;
  }, [photos]);
  const visible = useMemo(() => (chapter === 'all' ? photos : photos.filter((p) => p.chapter === chapter)), [photos, chapter]);

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
          style={{ background: 'radial-gradient(90% 55% at 50% 0%, rgba(79,31,85,0.38) 0%, rgba(10,8,7,0) 62%), radial-gradient(60% 40% at 50% 0%, rgba(201,169,97,0.08) 0%, rgba(10,8,7,0) 70%), #0A0807' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          role="dialog"
          aria-modal="true"
          aria-label="Our wedding photos"
        >
          <header className="relative px-4 pb-8 pt-16 text-center md:px-10 md:pt-14">
            <div className="absolute right-3 top-3 flex items-center gap-3 md:right-6 md:top-5">
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setLightbox(0);
                    setPlaying(true);
                  }}
                  className="ty-link text-[16px]"
                >
                  Play slideshow
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close gallery"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-foil/30 text-ivory/80 transition hover:border-foil hover:text-foil-light"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              </button>
            </div>
            <p className="ty-caps text-[12px] text-foil/80" style={{ letterSpacing: '0.28em' }}>Barcelona · September 2026</p>
            <h2 className="foil-text mx-auto mt-1 w-fit px-[0.2em] font-script text-[52px] leading-[1.2] md:text-[72px]">Our Wedding</h2>
            <div className="mx-auto mt-3 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-foil/60" />
              <span className="h-[5px] w-[5px] rotate-45 bg-foil/80" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-foil/60" />
            </div>
            {chapters.length > 1 && (
              <nav className="mx-auto mt-6 flex max-w-3xl justify-center gap-5 overflow-x-auto pb-1 scrollbar-hide" aria-label="Chapters">
                {['all', ...chapters].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChapter(c)}
                    aria-pressed={chapter === c}
                    className={`ty-caps whitespace-nowrap border-b pb-1 text-[13px] transition ${chapter === c ? 'border-foil text-foil-light' : 'border-transparent text-ivory/55 hover:text-foil-light'}`}
                  >
                    {c === 'all' ? 'All' : c}
                  </button>
                ))}
              </nav>
            )}
          </header>

          <div
            className="mx-auto columns-2 gap-3 px-3 pb-16 md:gap-5 md:px-10"
            style={{ maxWidth: visible.length < 7 ? '980px' : '1240px' }}
            data-cols={visible.length < 7 ? 'few' : 'many'}
          >
            {visible.map((p) => (
              <Thumb key={p.id} photo={p} index={photos.indexOf(p)} onOpen={setLightbox} />
            ))}
          </div>

          <footer className="pb-12 text-center">
            <div className="mx-auto mb-4 h-px w-24 bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
            <p className="font-display text-[16px] italic text-ivory/60">Photography by {THANK_YOU.photographer}</p>
            <p className="ty-caps mt-1 text-[11px] text-ivory/35">{THANK_YOU.hashtag}</p>
          </footer>

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
              />
            )}
          </AnimatePresence>
        </motion.div>
  );
}
