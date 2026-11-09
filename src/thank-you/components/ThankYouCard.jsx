import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
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

const capsLink = 'ty-caps inline-flex min-h-[44px] items-center px-2 lowercase text-foil-light/90 transition hover:text-foil-light focus-visible:text-foil-light focus-visible:outline-none';

function Front({ recipient, onRead, onPhotos, hasPhotos }) {
  return (
    <Stock>
      <div className="relative flex h-full flex-col items-center px-[10%] pb-[12cqw] pt-[10.5cqw] text-center">
        <div className="flex flex-col items-center">
          {recipient && (
            <p className="font-display italic text-ivory/85" style={{ fontSize: 'clamp(15px, 4.4cqw, 19px)', lineHeight: 1.2, textWrap: 'balance' }}>
              {recipient},
            </p>
          )}
          <h1 className="foil-text font-script font-normal" style={{ fontSize: 'clamp(54px, 16.5cqw, 76px)', lineHeight: 1.08, marginTop: '1.4cqw', paddingInline: '0.18em' }}>
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
          <p className="ty-caps mt-[5cqw] text-foil" style={{ fontSize: 'clamp(10.5px, 2.9cqw, 12.5px)' }}>
            Shriya &amp; Neil
          </p>
          <p className="mt-[1cqw] font-display italic text-ivory/60" style={{ fontSize: 'clamp(13px, 3.6cqw, 15.5px)' }}>
            Barcelona · {THANK_YOU.dates.replace(' – ', '–')}
          </p>
        </div>

        <span aria-hidden="true" className="flex-[1_0_4.5cqw]" />

        <div className="flex flex-col items-center gap-[2.6cqw]">
          <button
            type="button"
            onClick={onRead}
            className="ty-caps min-h-[46px] border border-foil/55 bg-foil/[0.06] px-[2.4em] font-semibold lowercase text-foil-light transition hover:border-foil hover:bg-foil/[0.14] focus-visible:border-foil focus-visible:bg-foil/[0.14] focus-visible:outline-none"
            style={{ fontSize: 'clamp(11.5px, 3cqw, 13px)' }}
          >
            Read your letter
          </button>
          {hasPhotos && (
            <button type="button" onClick={onPhotos} className="ty-link min-h-[40px]" style={{ fontSize: 'clamp(14px, 3.8cqw, 16.5px)' }}>
              Our photographs
            </button>
          )}
          {THANK_YOU.vogueUrl && (
            <a href={THANK_YOU.vogueUrl} target="_blank" rel="noopener noreferrer" className="ty-link" style={{ fontSize: 'clamp(14px, 3.8cqw, 16.5px)' }}>
              Read our story in <span className="not-italic">Vogue</span>
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

function Back({ letter, onFront, onPhotos, hasPhotos, firstReveal }) {
  const [scrolled, setScrolled] = useState(false);
  return (
    <Stock>
      <div className="relative flex h-full flex-col px-[10.5%] pb-[12cqw] pt-[10.5%]">
        {!letter ? (
          <div className="flex flex-1 items-center justify-center">
            <motion.span className="font-display italic text-ivory/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }}>
              Unfolding your letter…
            </motion.span>
          </div>
        ) : (
          <>
            <div
              className="scroll-fade thin-scroll relative -mr-[5%] min-h-0 flex-1 overflow-y-auto overscroll-contain pr-[5%]"
              data-scrolled={scrolled}
              onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
              tabIndex={0}
              aria-label="Your letter"
            >
              <div className="pb-[18px]">
                {letter.salutation && (
                  <p className="mb-[0.75em] font-display italic text-foil-light" style={{ fontSize: 'clamp(19px, 5.4cqw, 24px)', lineHeight: 1.25, textWrap: 'balance' }}>
                    {letter.salutation}
                  </p>
                )}
                {letter.paragraphs.map((p, i) => (
                  <motion.p
                    key={i}
                    className={`font-display ${p.startsWith('P.S.') ? 'italic text-ivory/70' : 'text-ivory/[0.88]'}`}
                    style={{ fontSize: 'clamp(16px, 4.35cqw, 19px)', lineHeight: 1.5, marginBottom: '0.72em', textWrap: 'pretty' }}
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
                  transition={{ delay: 0.45 + letter.paragraphs.length * 0.24, duration: 0.9 }}
                >
                  {letter.closing && (
                    <p className="mt-[1.2em] font-display italic text-ivory/80" style={{ fontSize: 'clamp(16px, 4.4cqw, 19px)' }}>
                      {letter.closing}
                    </p>
                  )}
                  <Signature text={letter.signature} afterClosing={!!letter.closing} />
                </motion.div>
              </div>
            </div>
            <div className="mt-[2.4cqw] flex flex-shrink-0 items-center justify-center gap-[0.6em]" style={{ fontSize: 'clamp(11px, 3cqw, 12.5px)' }}>
              <button type="button" onClick={onFront} className={capsLink}>
                Turn over
              </button>
              {hasPhotos && (
                <>
                  <span aria-hidden="true" className="h-[4px] w-[4px] rotate-45 bg-foil/70" />
                  <button type="button" onClick={onPhotos} className={capsLink}>
                    Photographs
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Stock>
  );
}

/**
 * The thank-you card. Front: the guest's names, "Thank You" and the film;
 * back: their letter. The flip turns the card edge-on, swaps faces and turns
 * it back, so the letter ends up as a flat, natively scrollable element.
 */
export function ThankYouCard({ recipient, letter, onOpenGallery, hasPhotos, onFaceChange }) {
  const [face, setFace] = useState('front');
  const [busy, setBusy] = useState(false);
  const revealed = useRef(false);
  const [firstReveal, setFirstReveal] = useState(true);
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
    } else {
      // the film unmounts with the front; let paused music resume
      window.dispatchEvent(new Event('video-pause'));
    }
    controls.set({ rotateY: -90 * dir });
    await controls.start({ rotateY: 0, transition: { duration: 0.45, ease: [0.2, 0.75, 0.35, 1] } });
    setBusy(false);
  };

  return (
    <div className="ty-card relative" style={{ perspective: '1800px' }}>
      <motion.div className="relative h-full w-full" style={{ containerType: 'inline-size' }} animate={controls} initial={{ rotateY: 0 }}>
        {face === 'front' ? (
          <Front recipient={recipient} onRead={() => flipTo('back')} onPhotos={onOpenGallery} hasPhotos={hasPhotos} />
        ) : (
          <Back letter={letter} onFront={() => flipTo('front')} onPhotos={onOpenGallery} hasPhotos={hasPhotos} firstReveal={firstReveal} />
        )}
      </motion.div>
    </div>
  );
}
