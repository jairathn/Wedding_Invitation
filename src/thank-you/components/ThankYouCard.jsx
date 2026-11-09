import { useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { VideoPlayer } from '../../components/VideoPlayer';
import { THANK_YOU } from '../config';

const EASE = [0.4, 0, 0.2, 1];

/** Centre flourish that interrupts the foil rule (top and bottom of the card). */
function Flourish({ className = '', flip = false }) {
  return (
    <svg
      viewBox="0 0 140 26"
      className={`pointer-events-none absolute left-1/2 ${className}`}
      style={{ width: 'clamp(84px, 30cqw, 128px)', transform: `translateX(-50%) ${flip ? 'scaleY(-1)' : ''}` }}
      aria-hidden="true"
    >
      <g fill="none" stroke="url(#ty-gold)" strokeWidth="0.9" strokeLinecap="round">
        <path d="M24 13 C34 13 40 6 48 6 C55 6 58 10 58 13 C58 16 55 19 50 19 C46 19 44 16 46 14" />
        <path d="M116 13 C106 13 100 6 92 6 C85 6 82 10 82 13 C82 16 85 19 90 19 C94 19 96 16 94 14" />
        <path d="M61 13 C64 10 67 10 70 6 C73 10 76 10 79 13 C76 16 73 16 70 20 C67 16 64 16 61 13 Z" fill="url(#ty-gold)" stroke="none" />
      </g>
      <circle cx="24" cy="13" r="1.3" fill="url(#ty-gold)" />
      <circle cx="116" cy="13" r="1.3" fill="url(#ty-gold)" />
    </svg>
  );
}

// Foil double rule, broken at top and bottom centre where the flourishes sit
const GAP = 'calc(clamp(84px, 30cqw, 128px) / 2 + 8px)';
function Rules() {
  const line = (inset, weight, alpha) => {
    const c = `rgba(201,169,97,${alpha})`;
    const seg = { position: 'absolute', height: weight, background: c };
    return (
      <>
        <div style={{ position: 'absolute', inset, borderLeft: `${weight} solid ${c}`, borderRight: `${weight} solid ${c}` }} />
        <div style={{ ...seg, top: inset, left: inset, right: `calc(50% + ${GAP})` }} />
        <div style={{ ...seg, top: inset, right: inset, left: `calc(50% + ${GAP})` }} />
        <div style={{ ...seg, bottom: inset, left: inset, right: `calc(50% + ${GAP})` }} />
        <div style={{ ...seg, bottom: inset, right: inset, left: `calc(50% + ${GAP})` }} />
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
          'radial-gradient(95% 50% at 50% 0%, rgba(201,169,97,0.11) 0%, rgba(201,169,97,0) 62%),' +
          'radial-gradient(85% 45% at 50% 100%, rgba(187,85,154,0.10) 0%, rgba(187,85,154,0) 66%),' +
          'linear-gradient(180deg, #171113 0%, #110C0E 55%, #0D0A0B 100%)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.68), 0 0 0 1px rgba(201,169,97,0.2), 0 0 90px rgba(235,88,209,0.09)',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.055] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <Rules />
      <Flourish className="top-[calc(3.2cqw-12px)]" />
      <Flourish className="bottom-[calc(3.2cqw-12px)]" flip />
      {children}
    </div>
  );
}

function VogueLine() {
  if (THANK_YOU.vogueUrl) {
    return (
      <a href={THANK_YOU.vogueUrl} target="_blank" rel="noopener noreferrer" className="ty-link" style={{ fontSize: 'clamp(13px, 3.6cqw, 15.5px)' }}>
        Read our story in <span className="not-italic tracking-[0.14em]">VOGUE</span> →
      </a>
    );
  }
  return (
    <p className="ty-caps text-ivory/40" style={{ fontSize: 'clamp(9.5px, 2.7cqw, 11px)' }}>
      Our story in <span className="font-display not-italic tracking-[0.2em] text-foil/70">VOGUE</span> · coming soon
    </p>
  );
}

function Front({ recipient, onRead, onPhotos, hasPhotos }) {
  return (
    <Stock>
      <div className="relative flex h-full flex-col items-center px-[10%] pb-[8%] pt-[11%] text-center">
        <p className="ty-caps text-foil" style={{ fontSize: 'clamp(11px, 3.1cqw, 13.5px)', letterSpacing: '0.26em' }}>
          Shriya &amp; Neil
        </p>
        <h1 className="foil-text font-script font-normal" style={{ fontSize: 'clamp(54px, 17cqw, 76px)', lineHeight: 1.18, marginTop: '0.06em', paddingInline: '0.18em' }}>
          Thank You
        </h1>
        {recipient && (
          <p
            className="font-display italic text-ivory/80"
            style={{ fontSize: recipient.length > 30 ? 'clamp(13.5px, 3.7cqw, 16px)' : 'clamp(16px, 4.6cqw, 20px)', lineHeight: 1.3, textWrap: 'balance' }}
          >
            for {recipient}
          </p>
        )}

        {/* the film, framed like a print */}
        <div className="relative my-auto w-[88%] p-[6px]" style={{ boxShadow: 'inset 0 0 0 1px rgba(201,169,97,0.5)' }}>
          {['-left-[3px] -top-[3px]', '-right-[3px] -top-[3px]', '-bottom-[3px] -left-[3px]', '-bottom-[3px] -right-[3px]'].map((pos) => (
            <span key={pos} aria-hidden="true" className={`absolute ${pos} h-[6px] w-[6px] border border-foil/80 bg-ink-900`} />
          ))}
          <div className="overflow-hidden bg-black" style={{ boxShadow: '0 12px 30px rgba(0,0,0,0.55)' }}>
            <VideoPlayer videoId={THANK_YOU.cardVimeoId} />
          </div>
        </div>

        <p className="ty-caps text-ivory/70" style={{ fontSize: 'clamp(10.5px, 2.95cqw, 12.5px)', letterSpacing: '0.22em' }}>
          {THANK_YOU.dates.replace(' – ', '–')} <span className="mx-[0.35em] text-foil/70">·</span> Barcelona
        </p>

        <div className="mt-[7%] flex w-full flex-col items-center gap-[0.9em]">
          <button type="button" onClick={onRead} className="ty-cta w-[78%] py-[0.95em]" style={{ fontSize: 'clamp(11.5px, 3.3cqw, 14px)' }}>
            Read your letter
          </button>
          {hasPhotos && (
            <button type="button" onClick={onPhotos} className="ty-link" style={{ fontSize: 'clamp(15px, 4.2cqw, 18px)' }}>
              View our photographs
            </button>
          )}
        </div>

        <div className="mt-[6%]">
          <VogueLine />
        </div>
      </div>
    </Stock>
  );
}

function Signature({ text }) {
  const m = text.match(/^(.*?)\s*(\(.*\))?$/);
  return (
    <p className="mt-[0.15em]">
      <span className="foil-text font-script" style={{ fontSize: 'clamp(32px, 9.4cqw, 42px)', lineHeight: 1.25, paddingInline: '0.12em' }}>
        {m[1]}
      </span>
      {m[2] && (
        <span className="ml-2 font-display italic text-ivory/70" style={{ fontSize: 'clamp(14px, 3.8cqw, 16.5px)' }}>
          {m[2]}
        </span>
      )}
    </p>
  );
}

function Back({ letter, onFront, onPhotos, hasPhotos, firstReveal }) {
  const longSalutation = (letter?.salutation || '').length > 32;
  return (
    <Stock>
      <div className="relative flex h-full flex-col px-[10.5%] pb-[8.5%] pt-[10.5%]">
        {!letter ? (
          <div className="flex flex-1 items-center justify-center">
            <motion.span className="font-display italic text-ivory/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }}>
              Unfolding your letter…
            </motion.span>
          </div>
        ) : (
          <>
            {letter.salutation && (
              <p
                className="flex-shrink-0 font-display italic text-foil-light"
                style={{ fontSize: longSalutation ? 'clamp(17px, 4.9cqw, 22px)' : 'clamp(21px, 6cqw, 27px)', lineHeight: 1.25, textWrap: 'balance' }}
              >
                {letter.salutation}
              </p>
            )}
            <div
              className="scroll-fade thin-scroll relative -mr-[5%] mt-[2%] min-h-0 flex-1 overflow-y-auto overscroll-contain pr-[5%]"
              tabIndex={0}
              aria-label="Your letter"
            >
              <div className="py-[18px]">
                {letter.paragraphs.map((p, i) => (
                  <motion.p
                    key={i}
                    className={`font-display ${p.startsWith('P.S.') ? 'italic text-ivory/70' : 'text-ivory/[0.88]'}`}
                    style={{ fontSize: 'clamp(16px, 4.35cqw, 19px)', lineHeight: 1.62, marginBottom: '0.85em', textWrap: 'pretty' }}
                    initial={firstReveal ? { opacity: 0, y: 8, filter: 'blur(4px)' } : false}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.3 + i * 0.24, duration: 0.8, ease: EASE }}
                  >
                    {p}
                  </motion.p>
                ))}
                <motion.div
                  initial={firstReveal ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + letter.paragraphs.length * 0.24, duration: 0.9 }}
                >
                  {letter.closing && (
                    <p className="mt-[1.1em] font-display italic text-ivory/80" style={{ fontSize: 'clamp(16px, 4.4cqw, 19px)' }}>
                      {letter.closing}
                    </p>
                  )}
                  <Signature text={letter.signature} />
                </motion.div>
              </div>
            </div>
            <div className="mt-[4%] flex flex-shrink-0 items-center justify-center gap-[1.1em]" style={{ fontSize: 'clamp(14px, 3.9cqw, 16.5px)' }}>
              <button type="button" onClick={onFront} className="ty-link">
                ← The card
              </button>
              {hasPhotos && (
                <>
                  <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-foil/70" />
                  <button type="button" onClick={onPhotos} className="ty-link">
                    Our photographs →
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
 * The thank-you card. Front: a personalised "Thank You" and the film; back:
 * the guest's letter. The flip turns the card edge-on, swaps faces and turns
 * it back, so the letter ends up as a flat, natively scrollable element.
 */
export function ThankYouCard({ recipient, letter, onOpenGallery, hasPhotos }) {
  const [face, setFace] = useState('front');
  const [busy, setBusy] = useState(false);
  const revealed = useRef(false);
  const [firstReveal, setFirstReveal] = useState(true);
  const controls = useAnimationControls();

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
