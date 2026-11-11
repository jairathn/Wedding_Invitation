import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useIsPresent } from 'framer-motion';
import { THANK_YOU } from '../config';
import { currentLayer, leaveLayers, pushLayer, updateLayer } from '../layers';
import { galleryTabs } from '../photos';
import { PhotoGrid } from './PhotoGrid';

const EASE = [0.4, 0, 0.2, 1];
const SLIDE_MS = 5200;
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const tracked = (em) => ({ letterSpacing: `${em}em`, textIndent: `${em}em` });
const BACK_ARROW = (
  <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden="true">
    <path d="M16 4H1.5M4.5 1L1.5 4l3 3" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);

// The viewer's image box: the space left by the controls, as in its CSS
function viewerSizes(photo) {
  const wide = window.innerWidth >= 768;
  const maxW = window.innerWidth - (wide ? 200 : 24);
  const maxH = window.innerHeight - (wide ? 132 : 148);
  return `${Math.ceil(Math.max(1, Math.min(maxW, (maxH * photo.w) / photo.h)))}px`;
}

function Lightbox({ photos, index, setIndex, onClose, playing, setPlaying, direct, onShowAll, showChapter }) {
  const photo = photos[index];
  const count = photos.length;
  const isPresent = useIsPresent(); // false while it fades out: no keys or slideshow ticks then
  const rootRef = useRef(null);
  const touch = useRef(null);
  const pinch = useRef(false);
  const [returnTo] = useState(() => document.activeElement);
  const [openedAt] = useState(() => performance.now());
  const [dir, setDir] = useState(1);
  const shownRef = useRef(index);
  useEffect(() => {
    shownRef.current = index;
  }, [index]);

  const go = useCallback(
    (step) => {
      setDir(step);
      setIndex((i) => (i === null ? null : (i + step + count) % count));
    },
    [count, setIndex],
  );

  // focus moves into the viewer, and on close to the last photo shown (its
  // tile, which the grid has scrolled into view) or else where it came from
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
    return () => {
      const tile = document.querySelector(`[data-photo="${shownRef.current}"]`);
      const target = tile || returnTo;
      if (target?.isConnected) target.focus({ preventScroll: true });
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

  // warm the neighbours, at the size the viewer will ask for
  useEffect(() => {
    [index + 1, index - 1].forEach((i) => {
      const p = photos[(i + count) % count];
      if (!p) return;
      const img = new Image();
      img.sizes = viewerSizes(p);
      img.srcset = p.srcSet;
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
        // a tap on the dark surround closes, but not the second click of the
        // double-click that opened it
        if (e.target === e.currentTarget && e.detail < 2 && performance.now() - openedAt > 450) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${count}`}
    >
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.img
          key={photo.id}
          src={photo.lg}
          srcSet={photo.srcSet}
          sizes={viewerSizes(photo)}
          alt={photo.alt || ''}
          custom={dir}
          className="max-h-[calc(100dvh-148px)] max-w-[calc(100vw-24px)] select-none object-contain shadow-[0_30px_90px_rgba(0,0,0,0.7)] md:max-h-[calc(100dvh-132px)] md:max-w-[calc(100vw-200px)]"
          style={{ aspectRatio: `${photo.w} / ${photo.h}`, backgroundColor: photo.shade }}
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
          {showChapter && photo.chapter ? `${photo.chapter} · ` : ''}
          {index + 1} of {count} · Photography by {THANK_YOU.photographer}
        </span>
      </p>
    </motion.div>
  );
}

function ChapterHeading({ chapter, count = null }) {
  return (
    <div className="py-12 text-center md:py-16">
      {chapter.number !== null && (
        <p className="ty-caps text-[13px] text-foil/80" style={tracked(0.2)}>
          {ROMAN[chapter.number] || ''}
        </p>
      )}
      <h3 className="foil-text mx-auto w-fit px-[0.2em] font-script text-[40px] leading-[1.25] md:text-[46px]">{chapter.name}</h3>
      <span className="mx-auto mt-2 block h-px w-16 bg-gradient-to-r from-transparent via-foil/70 to-transparent" aria-hidden="true" />
      {count !== null && (
        <p className="ty-caps mt-4 text-[12px] text-ivory/55" style={tracked(0.16)}>
          {count} photographs
        </p>
      )}
    </div>
  );
}

const coverOf = (chapter, featured) => featured.find((p) => p.chapter === chapter.name) || chapter.photos[0];

/** After the highlights: a card for each chapter, opening all of its photos. */
function ChapterCards({ chapters, featured, onPick }) {
  return (
    <section className="pt-20 md:pt-28" aria-labelledby="ty-every">
      <div className="text-center">
        <h3 id="ty-every" className="foil-text mx-auto w-fit px-[0.2em] font-script text-[40px] leading-[1.25] md:text-[46px]">
          Every Photograph
        </h3>
        <span className="mx-auto mt-2 block h-px w-16 bg-gradient-to-r from-transparent via-foil/70 to-transparent" aria-hidden="true" />
      </div>
      <div className={`mx-auto mt-10 grid gap-3 md:gap-6 ${chapters.length % 2 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'} ${chapters.length === 4 ? 'md:grid-cols-4' : ''}`}>
        {chapters.map((c) => {
          const cover = coverOf(c, featured);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              className="ty-chapter group relative block aspect-[4/5] w-full overflow-hidden focus:outline-none"
              style={{ backgroundColor: cover?.shade }}
            >
              {cover && (
                <img
                  src={cover.md}
                  srcSet={cover.srcSet}
                  sizes="(min-width: 1024px) 270px, (min-width: 768px) 25vw, 50vw"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-95"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-[#0A0807] via-[#0A0807]/35 to-transparent" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 flex flex-col items-center px-2 pb-4 text-center md:pb-6">
                {c.number !== null && (
                  <span className="ty-caps text-[12px] text-foil/85" style={tracked(0.2)}>
                    {ROMAN[c.number] || ''}
                  </span>
                )}
                <span className="foil-text px-[0.2em] font-script text-[30px] leading-[1.25] md:text-[36px]">{c.name}</span>
                <span className="ty-caps mt-1 text-[11px] text-ivory/70" style={tracked(0.16)}>
                  {c.photos.length} photographs
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Full-screen gallery. The first tab holds the highlights (the photos marked
 * `featured`, also on the film strips), then a tab for each chapter with all
 * of its photos. A film-strip frame opens straight into that photo, and
 * closing it goes straight back to the card. The panel mounts fresh on every
 * open.
 */
export function PhotoGallery({ open, photos, status = 'ready', onRetry, startIndex = null, token = null, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <GalleryPanel key={token || 'gallery'} photos={photos} status={status} onRetry={onRetry} startIndex={startIndex} token={token} onClose={onClose} />
      )}
    </AnimatePresence>
  );
}

function GalleryPanel({ photos, status, onRetry, startIndex, token, onClose }) {
  const tabs = useMemo(() => galleryTabs(photos), [photos]);
  const featured = tabs[0]?.id === 'highlights' ? tabs[0].photos : [];
  // Forward into a photo's history entry reopens that photo over its tab
  const [entry] = useState(() => {
    const c = currentLayer();
    return c?.token === token && c.ty === 'photo' ? c : null;
  });
  const [tabId, setTabId] = useState(entry?.tab ?? null);
  const tab = tabs.find((t) => t.id === tabId) || tabs[0] || null;
  const list = tab?.photos ?? [];
  const [lightbox, setLightbox] = useState(entry ? entry.index ?? 0 : startIndex);
  const [direct, setDirect] = useState(!entry && startIndex !== null);
  const [playing, setPlaying] = useState(false);
  const [reveal, setReveal] = useState(null);
  const [returnTo] = useState(() => document.activeElement);
  const panelRef = useRef(null);
  const barRef = useRef(null);
  const tabsRef = useRef(null);
  const anchorRef = useRef(null);
  const [barH, setBarH] = useState(64);

  // the tab bar sticks just under the top bar
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;
    const update = () => setBarH(bar.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);
  const stickAt = barH - 12; // over the top bar's soft lower edge
  const tabBarH = tabs.length > 1 ? 44 : 0;

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

  // Switching tabs starts the new one at its top, under the bars
  const selectTab = useCallback(
    (id, { focusTab = false } = {}) => {
      setTabId(id);
      setReveal(null);
      const panel = panelRef.current;
      const anchor = anchorRef.current;
      if (panel && anchor) {
        const natural = anchor.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop;
        if (panel.scrollTop > natural - stickAt) panel.scrollTop = natural - stickAt;
      }
      if (focusTab) window.requestAnimationFrame(() => document.getElementById(`ty-tab-${id}`)?.focus({ preventScroll: true }));
    },
    [stickAt],
  );
  // keep the chosen tab in view in the scrolling tab bar
  useEffect(() => {
    const bar = tabsRef.current;
    const el = tab && document.getElementById(`ty-tab-${tab.id}`);
    if (!bar || !el) return;
    const b = bar.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.left < b.left + 24 || r.right > b.right - 24) bar.scrollLeft += r.left - b.left - (b.width - r.width) / 2;
  }, [tab]);
  const onTabKey = (e) => {
    const i = tabs.indexOf(tab);
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const next = tabs[(to + tabs.length) % tabs.length];
    selectTab(next.id);
    document.getElementById(`ty-tab-${next.id}`)?.focus({ preventScroll: true });
  };

  // A photo opened from the grid has its own history entry: Back returns to the grid
  const openPhoto = useCallback(
    (i) => {
      pushLayer({ ty: 'photo', token, depth: 2, index: i, tab: tab?.id ?? null });
      setReveal(null);
      setLightbox(i);
    },
    [token, tab],
  );
  // back in the grid, the last photo shown is brought into view
  const backToGrid = useCallback(
    (last) => {
      setPlaying(false);
      setLightbox(null);
      if (last !== null && last !== undefined) setReveal({ index: last, clear: stickAt + tabBarH });
    },
    [stickAt, tabBarH],
  );
  const closeLightbox = useCallback(() => {
    setPlaying(false);
    if (direct) {
      onClose(); // opened from the film strip: straight back to the card
      return;
    }
    if (!leaveLayers(token, 1)) backToGrid(lightbox);
  }, [direct, onClose, token, lightbox, backToGrid]);
  const showAll = useCallback(() => {
    setDirect(false);
    backToGrid(lightbox);
    const c = currentLayer();
    if (c?.token === token && c.ty === 'gallery') updateLayer({ start: null });
  }, [token, lightbox, backToGrid]);
  // keep the photo's entry on the photo showing, so Forward returns to it
  useEffect(() => {
    const c = currentLayer();
    if (lightbox !== null && c?.token === token && c.ty === 'photo' && c.index !== lightbox) updateLayer({ index: lightbox });
  }, [lightbox, token]);
  const lightboxRef = useRef(lightbox);
  useEffect(() => {
    lightboxRef.current = lightbox;
  }, [lightbox]);
  useEffect(() => {
    const onPop = () => {
      const c = currentLayer();
      if (c?.token !== token) return; // the page opens and closes the gallery itself
      if (c.ty === 'photo') {
        setDirect(false);
        if (c.tab) setTabId(c.tab);
        setLightbox(c.index ?? 0);
      } else if (!direct) {
        backToGrid(lightboxRef.current);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [token, direct, backToGrid]);

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

  const ready = status === 'ready' && tab;
  const chapters = tabs.filter((t) => t.id !== 'highlights');
  const next = tab && tab.id !== 'highlights' ? tabs[tabs.indexOf(tab) + 1] : null;
  const gridProps = { total: list.length, onOpen: openPhoto, reveal };

  return (
    <motion.div
      ref={panelRef}
      tabIndex={-1}
      data-gallery-scroller=""
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
          ref={barRef}
          className="pointer-events-none sticky top-0 z-30 flex items-center justify-between gap-4 px-3 pb-3 pt-3 md:px-6 md:pt-5"
          style={{ background: 'linear-gradient(180deg, #0A0807 0%, rgba(10,8,7,0.94) 70%, rgba(10,8,7,0) 100%)' }}
        >
          {backButton()}
          {ready && list.length > 1 && (
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

        <header className="px-4 pb-8 pt-1 text-center md:px-12 md:pb-10">
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

        <div ref={anchorRef} aria-hidden="true" />
        {ready && tabs.length > 1 && (
          <div className="sticky z-20" style={{ top: stickAt, background: 'linear-gradient(180deg, rgba(10,8,7,0.94) 0%, rgba(10,8,7,0.94) 78%, rgba(10,8,7,0) 100%)' }}>
            <div ref={tabsRef} className="ty-tabs overflow-x-auto pb-2">
              <div role="tablist" aria-label="Chapters" className="mx-auto flex w-max gap-6 px-5 md:gap-10" onKeyDown={onTabKey}>
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    id={`ty-tab-${t.id}`}
                    type="button"
                    role="tab"
                    aria-selected={t.id === tab.id}
                    aria-controls="ty-tabpanel"
                    tabIndex={t.id === tab.id ? 0 : -1}
                    onClick={() => selectTab(t.id)}
                    className="ty-tab ty-caps relative inline-flex h-11 shrink-0 items-center whitespace-nowrap text-[12px] md:text-[13px]"
                    style={tracked(0.16)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          id="ty-tabpanel"
          role={ready && tabs.length > 1 ? 'tabpanel' : undefined}
          aria-labelledby={ready && tabs.length > 1 ? `ty-tab-${tab.id}` : undefined}
          className="mx-auto max-w-[1180px] px-4 pb-20 md:px-12"
        >
          {!ready ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center" role="status">
              {status === 'failed' ? (
                <>
                  <p className="font-display text-[17px] italic text-ivory/75">The photographs didn&rsquo;t load.</p>
                  <button type="button" onClick={onRetry} className="ty-link inline-flex min-h-[44px] items-center px-2 text-[16px]">
                    Try again
                  </button>
                </>
              ) : (
                <p className="font-display text-[17px] italic text-ivory/60">Gathering the photographs&hellip;</p>
              )}
            </div>
          ) : tab.id === 'highlights' ? (
            <>
              {tab.sections.map((sec) => (
                <section key={sec.chapter.id} aria-label={sec.chapter.name}>
                  {tab.sections.length > 1 ? <ChapterHeading chapter={sec.chapter} /> : <div className="pt-6" />}
                  <PhotoGrid key={`${tab.id}-${sec.start}`} photos={sec.photos} offset={sec.start} density="roomy" {...gridProps} />
                </section>
              ))}
              {chapters.length > 0 && <ChapterCards chapters={chapters} featured={featured} onPick={(id) => selectTab(id, { focusTab: true })} />}
            </>
          ) : (
            <>
              <ChapterHeading chapter={tab} count={tab.photos.length} />
              <PhotoGrid key={tab.id} photos={tab.photos} density="dense" {...gridProps} />
              {next && (
                <div className="pt-16 text-center md:pt-24">
                  <button type="button" onClick={() => selectTab(next.id, { focusTab: true })} className="ty-next group inline-flex flex-col items-center px-4 py-2 focus:outline-none">
                    <span className="ty-caps text-[12px] text-ivory/60" style={tracked(0.2)}>
                      Next
                    </span>
                    <span className="foil-text px-[0.2em] font-script text-[40px] leading-[1.25] md:text-[46px]">{next.name}</span>
                    <span className="ty-caps text-[11px] text-ivory/55 transition group-hover:text-foil-light" style={tracked(0.16)}>
                      {next.photos.length} photographs
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
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
        {ready && lightbox !== null && list[lightbox] && (
          <Lightbox
            key="lightbox"
            photos={list}
            index={lightbox}
            setIndex={setLightbox}
            onClose={closeLightbox}
            playing={playing}
            setPlaying={setPlaying}
            direct={direct}
            onShowAll={showAll}
            showChapter={tab.id === 'highlights'}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
