import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { matchGuest, firstName } from '../../lib/guests';
import { ENVELOPE_CLIP, THANK_YOU } from '../config';

export const FLAP = 0.3; // flap depth as a fraction of the envelope's height
export const ENVELOPE_WIDTH = 'min(372px, 76vw, calc(45 * var(--vh)))';
const EASE = [0.4, 0, 0.2, 1];
const touch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

// A poured-wax rim: alternating radii with a little irregularity
const RIM = Array.from({ length: 44 }, (_, i) => {
  const a = (i / 44) * Math.PI * 2;
  const r = 50 * (i % 2 ? 0.925 : 1) * (1 + 0.03 * Math.sin(i * 2.7) + 0.015 * Math.cos(i * 5.1));
  return `${(50 + r * Math.cos(a)).toFixed(2)}% ${(50 + r * Math.sin(a)).toFixed(2)}%`;
}).join(', ');
// The seal cracks along this line when it is broken
const LEFT_HALF = 'polygon(0 0, 53% 0, 46% 36%, 56% 61%, 48% 100%, 0 100%)';
const RIGHT_HALF = 'polygon(53% 0, 100% 0, 100% 100%, 48% 100%, 56% 61%, 46% 36%)';

/** Gold-foil Ganesha drawn through an alpha mask of the original artwork. */
export function GoldGanesha({ size }) {
  return (
    <div
      aria-hidden="true"
      className="foil-once"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: 'url(/images/thank-you/ganesha-mask.png)',
        maskImage: 'url(/images/thank-you/ganesha-mask.png)',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        background: 'linear-gradient(115deg, #8C6A2F 8%, #C9A961 30%, #F1DFB0 46%, #FFF8E6 52%, #D9BD7E 64%, #8C6A2F 92%)',
        backgroundSize: '240% 100%',
      }}
    />
  );
}

function SealFace() {
  return (
    <>
      <span
        className="absolute inset-0"
        style={{
          clipPath: `polygon(${RIM})`,
          background: 'radial-gradient(circle at 36% 30%, #A2457C 0%, #74215D 34%, #4E1343 70%, #320B2C 100%)',
        }}
      />
      {/* pressed centre */}
      <span
        className="absolute inset-[17%] rounded-full"
        style={{
          background: 'radial-gradient(circle at 40% 35%, #7E2A63 0%, #5A1749 60%, #45103A 100%)',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.6), inset 0 -1px 2px rgba(255,205,235,0.2), 0 1px 0 rgba(255,205,235,0.12)',
        }}
      />
      {/* specular highlight on the wax */}
      <span className="absolute inset-0" style={{ clipPath: `polygon(${RIM})`, background: 'radial-gradient(ellipse 46% 26% at 34% 20%, rgba(255,232,246,0.32), transparent 70%)' }} />
      <span
        className="absolute inset-0 flex items-center justify-center font-display font-semibold italic leading-none"
        style={{
          fontSize: 'clamp(26px, 8.6cqw, 33px)',
          color: '#D8BC7C',
          opacity: 0.92,
          letterSpacing: '0.01em',
          textShadow: '0 -1px 0 rgba(28,0,20,0.8), 0 1px 0 rgba(255,214,240,0.22)',
        }}
      >
        S&amp;N
      </span>
    </>
  );
}

function WaxSeal({ onClick }) {
  const size = 'clamp(74px, 23cqw, 92px)';
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Open your thank-you card"
      className="relative block cursor-pointer rounded-full focus:outline-none focus-visible:ring-1 focus-visible:ring-foil-light/80 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950"
      style={{ width: size, height: size, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.55))' }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 1, transition: { duration: 0.7 } }}
      transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* two halves that crack apart when the seal is broken */}
      <motion.span
        className="absolute inset-0"
        style={{ clipPath: LEFT_HALF }}
        exit={{ x: -12, y: 4, rotate: -16, opacity: 0, transition: { duration: 0.65, ease: EASE } }}
      >
        <SealFace />
      </motion.span>
      <motion.span
        className="absolute inset-0"
        style={{ clipPath: RIGHT_HALF }}
        exit={{ x: 12, y: 6, rotate: 13, opacity: 0, transition: { duration: 0.65, ease: EASE } }}
      >
        <SealFace />
      </motion.span>
    </motion.button>
  );
}

/** Velvet back panel with the folded-flap seams of a real envelope. */
function Velvet({ seams = true }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.045] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(80% 55% at 28% 16%, rgba(255,236,226,0.07), transparent 70%)' }} />
      <motion.div aria-hidden="true" className="absolute inset-0" initial={false} animate={{ opacity: seams ? 1 : 0 }} transition={{ duration: 0.8 }}>
        {/* bottom flap, a shade lighter */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(0 100%, 50% 58%, 100% 100%)', background: 'linear-gradient(0deg, #17120F, #120E0F)' }} />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points="0,100 50,58 100,100" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          <polyline points="0,100.6 50,58.7 100,100.6" fill="none" stroke="rgba(255,240,230,0.06)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {/* side flaps meet the bottom flap */}
          <polyline points="0,0 38,62" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <polyline points="100,0 62,62" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      </motion.div>
    </>
  );
}

const bodyStyle = {
  background: `radial-gradient(120% 75% at 50% 8%, #1B1517 0%, #110D0E 45%, ${ENVELOPE_CLIP.velvet} 100%)`,
  boxShadow: '0 28px 70px rgba(0,0,0,0.6), 0 0 0 0.75px rgba(201,169,97,0.3)',
};

/**
 * The envelope's back panel, drawn above the card while it slides out so the
 * card visibly comes from inside the envelope (rendered by the page during
 * the reveal, in the same place and with the same motion as the envelope).
 */
export function EnvelopePocket() {
  return (
    <div style={{ containerType: 'inline-size', width: ENVELOPE_WIDTH }}>
      <div
        className="relative overflow-hidden rounded-b-[4px]"
        style={{
          aspectRatio: '0.72',
          ...bodyStyle,
          // thumb-cut at the opening
          WebkitMaskImage: 'radial-gradient(circle 9cqw at 50% 0, transparent 98%, #000 100%)',
          maskImage: 'radial-gradient(circle 9cqw at 50% 0, transparent 98%, #000 100%)',
        }}
      >
        <Velvet />
      </div>
    </div>
  );
}

/**
 * Black-velvet portrait envelope. The guest touches the wax seal, writes
 * their name, the flap opens on a gold-foil "Dear …," and the first-dance
 * clip plays inside.
 */
export function ThankYouEnvelope({ stage, guestName, prefillName = '', onSealClick, onGuestMatched, onClipNearEnd }) {
  const [name, setName] = useState(prefillName);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [checking, setChecking] = useState(false);
  const [clipFailed, setClipFailed] = useState(false);
  const videoRef = useRef(null);
  const nearEndFired = useRef(false);

  const sealed = stage === 'sealed';
  const naming = stage === 'naming';
  const playing = stage === 'opening';
  const open = stage === 'opening' || stage === 'revealing' || stage === 'card';

  // Play the clip once the flap is open; tell the page when it is nearly done
  useEffect(() => {
    if (stage !== 'opening') return undefined;
    const video = videoRef.current;
    const fire = () => {
      if (!nearEndFired.current) {
        nearEndFired.current = true;
        onClipNearEnd?.();
      }
    };
    const startTimer = window.setTimeout(() => {
      video?.play().catch(() => setClipFailed(true));
    }, 650);
    const fallback = window.setTimeout(fire, clipFailed ? 4200 : 10500); // never leave a guest waiting
    const onTime = () => {
      if (video.duration && video.currentTime >= video.duration - 0.9) fire();
    };
    video?.addEventListener('timeupdate', onTime);
    video?.addEventListener('ended', fire);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(fallback);
      video?.removeEventListener('timeupdate', onTime);
      video?.removeEventListener('ended', fire);
    };
  }, [stage, clipFailed, onClipNearEnd]);

  const accept = (match) => {
    setSuggestions([]);
    setError('');
    onGuestMatched(match);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checking) return;
    setError('');
    setSuggestions([]);
    const result = matchGuest(name);
    if (result.status === 'empty') {
      setError('Please write your first and last name.');
      return;
    }
    setChecking(true);
    videoRef.current?.load(); // let iOS start buffering inside the tap
    await new Promise((r) => setTimeout(r, 420));
    setChecking(false);
    if (result.status === 'exact') return accept(result);
    if (result.status === 'fuzzy') {
      setSuggestions(result.suggestions.slice(0, 3));
      setError('Did you mean…');
      return;
    }
    setError('We couldn’t find that name on our guest list. If this link came from us and your name isn’t working, please text us.');
  };

  const greetingName = firstName(guestName);
  // sized by name length so "Dear …," always sits inside the widest part of the liner
  const n = greetingName.length;
  const greetingSize = n >= 10 ? 'clamp(19px, 6.2cqw, 25px)' : n >= 8 ? 'clamp(21px, 7cqw, 28px)' : n >= 6 ? 'clamp(24px, 8cqw, 32px)' : 'clamp(27px, 9cqw, 36px)';

  return (
    <div className="relative" style={{ containerType: 'inline-size', width: ENVELOPE_WIDTH }}>
      {/* soft scrim + contact shadow (no coloured halo: the seal is the only jewel) */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-14" style={{ background: 'radial-gradient(closest-side, rgba(11,5,9,0.5), transparent)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-[86%] -translate-x-1/2 rounded-[50%] bg-black/75 blur-2xl" />

      <div className="relative" style={{ aspectRatio: '0.72', perspective: '1400px' }}>
        {/* Envelope back panel */}
        <div className="absolute inset-0 overflow-hidden rounded-[4px]" style={bodyStyle}>
          <Velvet seams={!playing} />

          {/* First-dance clip in a window, feathered into the velvet */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-[3.4cqw] top-[3.4cqw] bottom-[17%] overflow-hidden"
            initial={false}
            animate={{ opacity: playing ? 1 : 0 }}
            transition={{ duration: playing ? 1.4 : 0.6, delay: playing ? 0.45 : 0, ease: 'easeOut' }}
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse 98% 94% at 50% 50%, #000 66%, transparent 100%)',
              maskImage: 'radial-gradient(ellipse 98% 94% at 50% 50%, #000 66%, transparent 100%)',
            }}
          >
            {(naming || open) && (
              <video
                ref={videoRef}
                muted
                playsInline
                preload="auto"
                poster={ENVELOPE_CLIP.poster}
                onError={() => setClipFailed(true)}
                className="h-full w-full object-cover"
                style={{ objectPosition: '50% 60%' }}
              >
                <source src={ENVELOPE_CLIP.src} type="video/mp4" />
              </video>
            )}
          </motion.div>

          {/* Hashtag set on the velvet beneath the window */}
          <AnimatePresence>
            {playing && (
              <motion.p
                key="hashtag"
                className="pointer-events-none absolute inset-x-0 bottom-[6%] text-center font-display italic text-foil-light/85"
                style={{ fontSize: 'clamp(15px, 5.2cqw, 20px)', letterSpacing: '0.02em' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.4 } }}
                transition={{ delay: 2.2, duration: 1.2 }}
                aria-hidden="true"
              >
                {THANK_YOU.hashtag}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Sender line, then the name, always below the flap point */}
          <AnimatePresence>
            {(sealed || naming) && (
              <motion.div
                key="front"
                className="absolute inset-x-[11%] bottom-[10%] z-30 flex flex-col items-center justify-center text-center"
                style={{ top: `calc(${FLAP * 100}% + clamp(46px, 15cqw, 58px))` }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {sealed ? (
                    <motion.div key="sender" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }} transition={{ duration: 0.8 }}>
                      <p className="font-display italic text-ivory/90" style={{ fontSize: 'clamp(22px, 7.6cqw, 29px)', lineHeight: 1.1 }}>
                        Shriya &amp; Neil
                      </p>
                      <p className="ty-caps mt-[0.7em] text-foil/80" style={{ fontSize: 'clamp(10.5px, 2.9cqw, 12.5px)' }}>
                        Barcelona · MMXXVI
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      noValidate
                      className="flex w-full flex-col items-center"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
                    >
                      <label htmlFor="guest-name" className="ty-caps lowercase text-foil/80" style={{ fontSize: 'clamp(10.5px, 2.9cqw, 12.5px)' }}>
                        Addressed to
                      </label>
                      <input
                        id="guest-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="your first & last name"
                        autoComplete="name"
                        autoCapitalize="words"
                        enterKeyHint="go"
                        spellCheck={false}
                        autoFocus
                        className="mt-[3cqw] w-full rounded-none border-0 border-b border-foil/50 bg-transparent px-1 pb-[0.25em] text-center font-display italic text-foil-light placeholder:text-ivory/30 focus:border-foil-light focus:outline-none"
                        style={{ fontSize: 'clamp(22px, 7.4cqw, 28px)', lineHeight: 1.25 }}
                      />
                      <button
                        type="submit"
                        disabled={checking}
                        className="ty-caps mt-[6cqw] inline-flex min-h-[46px] items-center gap-3 border border-foil/55 bg-foil/[0.06] px-[1.6em] font-semibold lowercase text-foil-light transition hover:border-foil hover:bg-foil/[0.14] disabled:opacity-60"
                        style={{ fontSize: 'clamp(11.5px, 3cqw, 13px)' }}
                      >
                        {checking ? 'One moment' : 'Open'}
                        <svg width="22" height="8" viewBox="0 0 22 8" aria-hidden="true">
                          <path d="M0 4h20M17 1l3 3-3 3" fill="none" stroke="#C9A961" strokeWidth="1" />
                        </svg>
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Flap: velvet outside, banded gold-foil liner inside */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 origin-top"
          style={{ height: `${FLAP * 100}%`, transformStyle: 'preserve-3d', zIndex: 20 }}
          initial={false}
          animate={{ rotateX: open ? -180 : 0 }}
          transition={{ duration: 0.95, ease: EASE }}
        >
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
              background: 'linear-gradient(180deg, #1E1719 0%, #141011 62%, #0F0B0C 100%)',
            }}
          />
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
            <polyline points="0,0 50,100 100,0" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="5" vectorEffect="non-scaling-stroke" transform="translate(0 1.4)" />
            <polyline points="0.4,0 50,99.2 99.6,0" fill="none" stroke="rgba(201,169,97,0.55)" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
          </svg>
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
              background: 'linear-gradient(118deg, #6E4F1C 0%, #B8924A 16%, #F3E2B4 28%, #C49B52 40%, #8C6A2F 54%, #E2C88A 68%, #A27C3C 82%, #6E4F1C 100%)',
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.22]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22'%3E%3Cg fill='none' stroke='%23432808' stroke-width='0.7'%3E%3Cpath d='M11 4c2 3 2 5 0 7-2-2-2-4 0-7z'/%3E%3Cpath d='M11 18c-2-3-2-5 0-7 2 2 2 4 0 7z'/%3E%3Cpath d='M4 11c3-2 5-2 7 0-2 2-4 2-7 0z'/%3E%3Cpath d='M18 11c-3 2-5 2-7 0 2-2 4-2 7 0z'/%3E%3C/g%3E%3C/svg%3E\")",
                backgroundSize: '22px 22px',
              }}
            />
            {/* fold shadow along the hinge */}
            <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.35), transparent 18%)' }} />
            {open && greetingName && (
              <motion.p
                className="absolute inset-x-0 text-center font-script"
                style={{
                  top: '54%',
                  fontSize: greetingSize,
                  lineHeight: 1.2,
                  color: '#4A2F0C',
                  textShadow: '0 1px 0 rgba(255,246,222,0.7), 0 -1px 0 rgba(60,35,5,0.25)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1.2 }}
              >
                Dear {greetingName},
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Seal → Ganesha roundel at the flap's point */}
        <div className="absolute left-1/2 z-30 -translate-x-1/2 -translate-y-1/2" style={{ top: `${FLAP * 100}%` }}>
          <AnimatePresence mode="wait">
            {sealed && <WaxSeal key="seal" onClick={onSealClick} />}
            {naming && (
              <motion.div
                key="ganesha"
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 'clamp(58px, 18.5cqw, 70px)',
                  height: 'clamp(58px, 18.5cqw, 70px)',
                  background: '#100C0D',
                  boxShadow: '0 0 0 0.75px rgba(201,169,97,0.55), 0 0 0 4px #100C0D, 0 0 0 4.75px rgba(201,169,97,0.2)',
                }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
              >
                <GoldGanesha size="clamp(38px, 12cqw, 46px)" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hint under the envelope while sealed; help and suggestions while naming */}
      <AnimatePresence>
        {sealed && (
          <motion.p
            key="hint"
            className="pointer-events-none absolute inset-x-0 top-full mt-7 text-center font-display text-[16px] italic text-ivory/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ delay: 2.2, duration: 1.4 }}
          >
            {touch ? 'Tap the seal to open' : 'Click the seal to open'}
          </motion.p>
        )}
        {naming && (error || suggestions.length > 0) && (
          <motion.div
            key="help"
            className="absolute inset-x-0 top-full z-30 mt-6 text-center"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            role="alert"
          >
            {error && <p className="font-display text-[16px] italic leading-snug text-blush-200/90">{error}</p>}
            {suggestions.length > 0 && (
              <div className="mt-3 flex flex-col items-center gap-2.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setName(s);
                      const m = matchGuest(s);
                      if (m.status === 'exact') accept(m);
                    }}
                    className="ty-link text-[19px]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
