import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { VideoPlayer } from '../../components/VideoPlayer';
import { GoldGanesha } from './ThankYouEnvelope';
import { THANK_YOU } from '../config';

const EASE = [0.4, 0, 0.2, 1];
const CREST = 'clamp(24px, 6.8cqw, 30px)'; // Ganesha crest breaking the top rule

/** Foil double rule, broken at the top for the crest and at the bottom for a diamond. */
function Rules() {
  const gapTop = `calc(${CREST} / 2 + 11px)`;
  const gapBottom = '12px';
  const line = (inset, weight, alpha) => {
    const c = `rgba(201,169,97,${alpha})`;
    const seg = { position: 'absolute', height: weight, background: c };
    return (
      <>
        <div style={{ position: 'absolute', inset, borderLeft: `${weight} solid ${c}`, borderRight: `${weight} solid ${c}` }} />
        <div style={{ ...seg, top: inset, left: inset, right: `calc(50% + ${gapTop})` }} />
        <div style={{ ...seg, top: inset, right: inset, left: `calc(50% + ${gapTop})` }} />
        <div style={{ ...seg, bottom: inset, left: inset, right: `calc(50% + ${gapBottom})` }} />
        <div style={{ ...seg, bottom: inset, right: inset, left: `calc(50% + ${gapBottom})` }} />
      </>
    );
  };
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {line('3.2cqw', '1px', 0.55)}
      {line('4.4cqw', '0.5px', 0.26)}
      {['left-[3.2cqw] top-[3.2cqw]', 'right-[3.2cqw] top-[3.2cqw]', 'bottom-[3.2cqw] left-[3.2cqw]', 'bottom-[3.2cqw] right-[3.2cqw]'].map((pos) => (
        <span key={pos} className={`absolute ${pos} h-[5px] w-[5px] rotate-45 bg-foil`} style={{ margin: '-2px' }} />
      ))}
      <div className="absolute left-1/2 top-[3.8cqw] -translate-x-1/2 -translate-y-1/2">
        <GoldGanesha size={CREST} />
      </div>
      <span className="absolute bottom-[3.8cqw] left-1/2 h-[6px] w-[6px] -translate-x-1/2 translate-y-1/2 rotate-45 bg-foil" />
    </div>
  );
}

/** Black card stock with a foil double rule. */
function Stock({ children }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[3px]"
      style={{
        background:
          'radial-gradient(95% 50% at 50% 0%, rgba(201,169,97,0.10) 0%, rgba(201,169,97,0) 62%),' +
          'linear-gradient(180deg, #171113 0%, #110C0E 55%, #0D0A0B 100%)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.68), 0 0 0 1px rgba(201,169,97,0.2)',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <Rules />
      {children}
    </div>
  );
}

// Small caps keep their tracking modest so the words still read as words
const tracked = (em) => ({ letterSpacing: `${em}em`, textIndent: `${em}em` });
const capsLink = 'ty-caps inline-flex min-h-[44px] items-center px-2 text-foil-light/90 transition hover:text-foil-light focus-visible:text-foil-light focus-visible:outline-none';
const ctaClass =
  'ty-caps min-h-[46px] border border-foil/55 bg-foil/[0.06] px-[2em] font-semibold text-foil-light transition hover:border-foil hover:bg-foil/[0.14] focus-visible:border-foil focus-visible:bg-foil/[0.14] focus-visible:outline-none';
const ctaStyle = { fontSize: 'clamp(14px, 4.1cqw, 16px)', ...tracked(0.16) };

function Front({ recipient, onRead, onPhotos, hasPhotos }) {
  return (
    <Stock>
      {/* scrolls only as a last resort, when a very short screen can't fit it all */}
      <div className="thin-scroll relative flex h-full flex-col items-center overflow-y-auto overscroll-contain px-[10%] pb-[9.5cqw] pt-[10.5cqw] text-center">
        <div className="flex flex-col items-center">
          {recipient && (
            <p className="font-display italic text-ivory/85" style={{ fontSize: 'clamp(16px, 4.6cqw, 20px)', lineHeight: 1.2, textWrap: 'balance' }}>
              {recipient},
            </p>
          )}
          <h1
            className="foil-text font-script font-normal"
            style={{ fontSize: 'clamp(46px, 15.5cqw, 76px)', lineHeight: 1.08, marginTop: '1.4cqw', paddingInline: '0.18em', whiteSpace: 'nowrap' }}
          >
            Thank You
          </h1>
        </div>

        <span aria-hidden="true" className="flex-[1_0_4cqw]" />

        {/* the film, matted like a framed print, captioned with the sign-off */}
        <div className="flex w-full flex-col items-center">
          <div className="relative w-[84%]" style={{ padding: '2.4cqw', background: '#070506', boxShadow: '0 0 0 0.75px rgba(201,169,97,0.6), 0 18px 40px rgba(0,0,0,0.6)' }}>
            <div className="overflow-hidden" style={{ boxShadow: '0 0 0 0.5px rgba(201,169,97,0.35)' }}>
              <VideoPlayer videoId={THANK_YOU.cardVimeoId} color="c9a961" showFullscreenButton={false} />
            </div>
          </div>
          <p className="ty-caps mt-[4.4cqw] text-foil" style={{ fontSize: 'clamp(13px, 3.6cqw, 15px)', ...tracked(0.2) }}>
            Shriya &amp; Neil
          </p>
          <p className="mt-[0.6cqw] font-display italic text-ivory/70" style={{ fontSize: 'clamp(14px, 3.8cqw, 16px)' }}>
            Barcelona · {THANK_YOU.dates.replace(' – ', '–')}
          </p>
        </div>

        <span aria-hidden="true" className="flex-[1_0_4cqw]" />

        <div className="flex flex-col items-center gap-[2.4cqw]">
          <button type="button" data-read onClick={onRead} className={ctaClass} style={ctaStyle}>
            Read your letter
          </button>
          {hasPhotos && (
            <button type="button" onClick={onPhotos} className="ty-link inline-flex min-h-[44px] items-center px-3" style={{ fontSize: 'clamp(16px, 4.3cqw, 18px)' }}>
              Our photographs
            </button>
          )}
          {THANK_YOU.vogueUrl && (
            <a
              href={THANK_YOU.vogueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ty-link inline-flex min-h-[44px] items-center px-3"
              style={{ fontSize: 'clamp(16px, 4.3cqw, 18px)' }}
            >
              Read our story in <span className="not-italic">&nbsp;Vogue</span>
            </a>
          )}
        </div>
      </div>
    </Stock>
  );
}

function Signature({ text, afterClosing }) {
  const m = text.match(/^(.*?)\s*(\(.*\))?$/);
  const [left, right] = m[1].split('&').map((t) => t.trim());
  return (
    <p className={`${afterClosing ? 'mt-[0.1em]' : 'mt-[1.1em]'} flex flex-wrap items-baseline`}>
      <span className="foil-text font-script" style={{ fontSize: 'clamp(32px, 9.4cqw, 42px)', lineHeight: 1.25, paddingInline: '0.12em' }}>
        {left}
        {right && (
          <span className="font-display italic" style={{ fontSize: '0.7em', padding: '0 0.3em 0 0.24em', verticalAlign: '0.06em' }}>
            &amp;
          </span>
        )}
        {right}
      </span>
      {m[2] && (
        <span className="ml-2 font-display italic text-ivory/70" style={{ fontSize: 'clamp(14px, 3.8cqw, 16.5px)' }}>
          {m[2]}
        </span>
      )}
    </p>
  );
}

/** First few words in small caps, the way a printed letter or book opens. */
function LeadIn({ text }) {
  const words = text.split(' ');
  return (
    <>
      <span className="ty-caps" style={{ letterSpacing: '0.06em' }}>
        {words.slice(0, 3).join(' ')}
      </span>{' '}
      {words.slice(3).join(' ')}
    </>
  );
}

const letterText = { fontSize: 'clamp(18px, 5.4cqw, 21px)', lineHeight: 1.55, fontWeight: 500 };

/** While the letter loads, or if it couldn't. Remounted per status, so its timer restarts. */
function LetterPending({ status, onRetry }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (status !== 'loading') return undefined;
    const t = window.setTimeout(() => setSlow(true), 9000);
    return () => window.clearTimeout(t);
  }, [status]);
  const failed = status === 'failed';
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center" role="status">
      {failed ? (
        <p className="font-display italic text-ivory/85" style={{ fontSize: 'clamp(18px, 5cqw, 20px)', lineHeight: 1.4 }}>
          We couldn’t unfold your letter just now.
        </p>
      ) : (
        <motion.p className="font-display italic text-ivory/70" style={{ fontSize: 'clamp(18px, 5cqw, 20px)' }} animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.6, repeat: Infinity }}>
          Unfolding your letter…
        </motion.p>
      )}
      {(failed || slow) && (
        <button type="button" onClick={onRetry} className={ctaClass} style={ctaStyle}>
          Try again
        </button>
      )}
    </div>
  );
}

function Back({ letter, status, onRetry, onFront, onPhotos, hasPhotos, firstReveal }) {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [more, setMore] = useState(false);

  // "Continue reading" shows while part of the letter is still below the fold
  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrolled(el.scrollTop > 4);
    setMore(el.scrollTop + el.clientHeight < el.scrollHeight - 24);
  }, []);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [letter, measure]);

  const paragraphs = letter?.paragraphs ?? [];
  const revealDone = 0.6 + paragraphs.length * 0.24;

  return (
    <Stock>
      <div className="relative flex h-full flex-col px-[10.5%] pb-[9.5cqw] pt-[10.5%]">
        {!letter ? (
          <LetterPending key={status} status={status} onRetry={onRetry} />
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div
              ref={scrollRef}
              data-letter
              className="scroll-fade thin-scroll relative -mr-[5%] min-h-0 flex-1 overflow-y-auto overscroll-contain pr-[5%] focus:outline-none"
              data-scrolled={scrolled}
              onScroll={measure}
              tabIndex={0}
              role="region"
              aria-label="Your letter"
            >
              <div ref={contentRef} className="pb-[22px]">
                {letter.salutation && (
                  <p className="mb-[0.7em] font-display italic text-foil-light" style={{ fontSize: 'clamp(20px, 5.9cqw, 25px)', lineHeight: 1.25, fontWeight: 500, textWrap: 'balance' }}>
                    {letter.salutation}
                  </p>
                )}
                {paragraphs.map((p, i) => (
                  <motion.p
                    key={i}
                    className={`font-display ${p.startsWith('P.S.') ? 'italic text-ivory/80' : 'text-ivory/[0.92]'}`}
                    style={{ ...letterText, marginBottom: '0.75em', textWrap: 'pretty' }}
                    initial={firstReveal ? { opacity: 0, y: 8, filter: 'blur(4px)' } : false}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.3 + i * 0.24, duration: 0.8, ease: EASE }}
                  >
                    {i === 0 && letter.salutation ? <LeadIn text={p} /> : p}
                  </motion.p>
                ))}
                <motion.div
                  initial={firstReveal ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + paragraphs.length * 0.24, duration: 0.9 }}
                >
                  {letter.closing && (
                    <p className="mt-[1.1em] font-display italic text-ivory/85" style={letterText}>
                      {letter.closing}
                    </p>
                  )}
                  <Signature text={letter.signature} afterClosing={!!letter.closing} />
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {more && (
                <motion.button
                  key="more"
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => {
                    const el = scrollRef.current;
                    el?.scrollBy({ top: el.clientHeight * 0.7, behavior: 'smooth' });
                  }}
                  className="ty-caps absolute bottom-[2px] left-1/2 z-10 inline-flex min-h-[40px] -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-foil/40 bg-[#110C0E]/95 px-[1.2em] text-foil-light shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
                  style={{ fontSize: 'clamp(13px, 3.6cqw, 14px)', ...tracked(0.14) }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: firstReveal ? revealDone : 0.3, duration: 0.6 } }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                >
                  Continue reading
                  <svg width="9" height="12" viewBox="0 0 9 12" aria-hidden="true">
                    <path d="M4.5 0v10.5M1 7.2l3.5 3.5L8 7.2" fill="none" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* always present, so the back of the card is never a dead end */}
        <div className="mt-[2.4cqw] flex flex-shrink-0 items-center justify-center gap-[0.5em]" style={{ fontSize: 'clamp(14px, 3.9cqw, 15.5px)' }}>
          <button type="button" data-turn onClick={onFront} className={capsLink} style={tracked(0.16)}>
            Turn over
          </button>
          {hasPhotos && (
            <>
              <span aria-hidden="true" className="h-[4px] w-[4px] rotate-45 bg-foil/70" />
              <button type="button" onClick={onPhotos} className={capsLink} style={tracked(0.16)}>
                Photographs
              </button>
            </>
          )}
        </div>
      </div>
    </Stock>
  );
}

/**
 * The thank-you card. Front: the guest's names, "Thank You" and the film;
 * back: their letter. The flip turns the card edge-on, swaps faces and turns
 * it back, so the letter ends up as a flat, natively scrollable element.
 */
export function ThankYouCard({ recipient, letter, letterStatus, onRetryLetter, onOpenGallery, hasPhotos, onFaceChange }) {
  const [face, setFace] = useState('front');
  const [busy, setBusy] = useState(false);
  const revealed = useRef(false);
  const [firstReveal, setFirstReveal] = useState(true);
  const rootRef = useRef(null);
  const controls = useAnimationControls();

  useEffect(() => {
    onFaceChange?.(face);
  }, [face, onFaceChange]);

  const flipTo = async (target) => {
    if (busy || target === face) return;
    setBusy(true);
    const dir = target === 'back' ? 1 : -1;
    await controls.start({ rotateY: 90 * dir, transition: { duration: 0.32, ease: [0.55, 0, 0.8, 0.25] } });
    setFace(target);
    if (target === 'back') {
      setFirstReveal(!revealed.current);
      revealed.current = true;
      // the film goes away with the front: if it had paused the music, resume it
      window.dispatchEvent(new Event('video-pause'));
    }
    controls.set({ rotateY: -90 * dir });
    await controls.start({ rotateY: 0, transition: { duration: 0.45, ease: [0.2, 0.75, 0.35, 1] } });
    setBusy(false);
    // the button that was pressed is gone; keep focus on the card (keyboard, VoiceOver)
    const next = rootRef.current?.querySelector(target === 'back' ? '[data-letter], [data-turn]' : '[data-read]');
    next?.focus({ preventScroll: true });
  };

  return (
    <div ref={rootRef} className="ty-card relative" style={{ perspective: '1800px' }}>
      <motion.div className="relative h-full w-full" style={{ containerType: 'inline-size' }} animate={controls} initial={{ rotateY: 0 }}>
        {face === 'front' ? (
          <Front recipient={recipient} onRead={() => flipTo('back')} onPhotos={onOpenGallery} hasPhotos={hasPhotos} />
        ) : (
          <Back
            letter={letter}
            status={letterStatus}
            onRetry={onRetryLetter}
            onFront={() => flipTo('front')}
            onPhotos={onOpenGallery}
            hasPhotos={hasPhotos}
            firstReveal={firstReveal}
          />
        )}
      </motion.div>
    </div>
  );
}
