import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { matchGuest, firstName } from '../../lib/guests';
import { ENVELOPE_CLIP, THANK_YOU } from '../config';

const FLAP = 0.4; // flap depth as a fraction of the envelope's height
const EASE = [0.4, 0, 0.2, 1];
const touch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

/** Gold-foil Ganesha drawn through an alpha mask of the original artwork. */
function GoldGanesha({ size }) {
  return (
    <div
      aria-hidden="true"
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
        animation: 'foil-sweep 7s linear infinite',
        filter: 'drop-shadow(0 0 8px rgba(201,169,97,0.3))',
      }}
    />
  );
}

function WaxSeal({ onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Open your thank-you card"
      className="relative block cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-foil-light/80 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950"
      style={{ width: 'clamp(76px, 24cqw, 96px)', height: 'clamp(76px, 24cqw, 96px)' }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.25, filter: 'blur(6px)', transition: { duration: 0.55, ease: EASE } }}
      transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute -inset-4 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(235,88,209,0.32) 0%, rgba(235,88,209,0) 68%)' }}
        animate={{ opacity: [0.4, 0.95, 0.4], scale: [0.94, 1.06, 0.94] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* wax body with an irregular poured edge */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 36% 30%, #C24C93 0%, #8E2A6E 36%, #611651 74%, #4A103E 100%)',
          boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.5), inset 0 -2px 6px rgba(255,210,240,0.14), 0 6px 18px rgba(0,0,0,0.6)',
          clipPath:
            'polygon(50% 0%, 61% 2%, 71% 1%, 80% 5%, 88% 9%, 95% 17%, 98% 26%, 100% 37%, 99% 48%, 100% 59%, 97% 69%, 94% 79%, 88% 87%, 80% 93%, 70% 97%, 60% 99%, 50% 100%, 39% 98%, 29% 99%, 20% 94%, 12% 89%, 6% 81%, 2% 71%, 1% 60%, 0% 49%, 1% 38%, 3% 27%, 7% 17%, 13% 9%, 21% 4%, 30% 1%, 40% 2%)',
          borderRadius: '50%',
        }}
      />
      {/* pressed ring */}
      <span aria-hidden="true" className="absolute inset-[13%] rounded-full" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.55), 0 1px 0 rgba(255,210,240,0.16)' }} />
      <span className="relative flex h-full w-full flex-col items-center justify-center pb-[2px]">
        <span
          className="font-display font-semibold italic leading-none"
          style={{
            fontSize: 'clamp(25px, 8cqw, 31px)',
            color: '#F1DFB0',
            letterSpacing: '0.02em',
            textShadow: '0 1px 0 rgba(60,8,40,0.95), 0 -1px 0 rgba(255,236,250,0.22), 0 0 14px rgba(241,223,176,0.3)',
          }}
        >
          S&amp;N
        </span>
        <span className="ty-caps mt-[5px] text-[10px] leading-none" style={{ letterSpacing: '0.14em', color: 'rgba(253,232,244,0.95)', textShadow: '0 1px 2px rgba(40,4,28,0.9)' }}>
          {touch ? 'tap to open' : 'click to open'}
        </span>
      </span>
    </motion.button>
  );
}

/**
 * Black-velvet portrait envelope. The guest taps the wax seal, enters their
 * name, the flap opens on a gold-foil "Dear …," and the first-dance clip
 * plays inside the envelope.
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
      if (video.duration && video.currentTime >= video.duration - 1.1) fire();
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
    setError('');
    setSuggestions([]);
    const result = matchGuest(name);
    if (result.status === 'empty') {
      setError('Please enter your first and last name.');
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
  const greetingSize =
    greetingName.length > 9 ? 'clamp(22px, 7.4cqw, 30px)' : greetingName.length > 6 ? 'clamp(26px, 8.8cqw, 36px)' : 'clamp(30px, 10.4cqw, 42px)';

  return (
    <div className="relative" style={{ containerType: 'inline-size', width: 'min(340px, 76vw, 44svh)' }}>
      {/* halo + contact shadow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-12 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(closest-side, rgba(201,169,97,0.13), rgba(235,88,209,0.07) 55%, transparent 100%)',
          opacity: open ? 1 : 0.8,
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-[86%] -translate-x-1/2 rounded-[50%] bg-black/75 blur-2xl" />

      <div className="relative" style={{ aspectRatio: '0.72', perspective: '1400px' }}>
        {/* Envelope body */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[4px]"
          style={{
            background: `radial-gradient(120% 75% at 50% 8%, #1B1517 0%, #110D0E 45%, ${ENVELOPE_CLIP.velvet} 100%)`,
            boxShadow: '0 28px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,169,97,0.24)',
          }}
        >
          {/* velvet nap */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.08] mix-blend-screen"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
          {/* gold foil keylines */}
          <div aria-hidden="true" className="absolute inset-[3.4cqw] rounded-[2px]" style={{ boxShadow: 'inset 0 0 0 1px rgba(201,169,97,0.5)' }} />
          <div aria-hidden="true" className="absolute inset-[4.6cqw] rounded-[1px]" style={{ boxShadow: 'inset 0 0 0 0.5px rgba(201,169,97,0.22)' }} />

          {/* First-dance clip, feathered into the velvet */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-[3.4cqw] overflow-hidden"
            initial={false}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 1.4, delay: open ? 0.45 : 0, ease: 'easeOut' }}
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse 96% 92% at 50% 50%, #000 66%, transparent 100%)',
              maskImage: 'radial-gradient(ellipse 96% 92% at 50% 50%, #000 66%, transparent 100%)',
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
                style={{ objectPosition: '50% 58%' }}
              >
                <source src={ENVELOPE_CLIP.src} type="video/mp4" />
              </video>
            )}
            <div className="absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-t from-black/80 to-transparent" />
          </motion.div>

          {/* Hashtag, letter by letter, over the bottom of the clip */}
          {open && (
            <div className="pointer-events-none absolute inset-x-0 bottom-[7.5%] flex justify-center" aria-hidden="true">
              {THANK_YOU.hashtag.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  className="foil-text font-display italic"
                  style={{ fontSize: 'clamp(15px, 5.4cqw, 21px)', letterSpacing: '0.02em' }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 + i * 0.08, duration: 0.5, ease: EASE }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>
          )}

          {/* Sender line + name entry, always below the flap point */}
          <AnimatePresence>
            {(sealed || naming) && (
              <motion.div
                key="front"
                className="absolute inset-x-[11%] bottom-[9%] z-30 flex flex-col items-center text-center"
                style={{ top: `calc(${FLAP * 100}% + clamp(52px, 17cqw, 64px))` }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
              >
                <motion.div layout transition={{ duration: 0.6, ease: EASE }} className={naming ? '' : 'my-auto'}>
                  <p className="font-display italic text-ivory/95" style={{ fontSize: 'clamp(23px, 8cqw, 30px)', lineHeight: 1.1 }}>
                    Shriya &amp; Neil
                  </p>
                  <div className="mx-auto my-[0.7em] h-px w-10 bg-gradient-to-r from-transparent via-foil/70 to-transparent" aria-hidden="true" />
                  <p className="ty-caps text-foil/85" style={{ fontSize: 'clamp(10.5px, 3.3cqw, 12.5px)' }}>
                    A note of thanks
                  </p>
                </motion.div>

                <AnimatePresence>
                  {naming && (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      noValidate
                      className="mt-auto w-full"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, delay: 0.25, ease: EASE }}
                    >
                      <label htmlFor="guest-name" className="sr-only">
                        Your first and last name
                      </label>
                      <input
                        id="guest-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Your first & last name"
                        autoComplete="name"
                        autoCapitalize="words"
                        spellCheck={false}
                        autoFocus
                        className="w-full rounded-none border-0 border-b border-foil/45 bg-transparent px-1 pb-2 pt-1 text-center font-display text-ivory placeholder:italic placeholder:text-ivory/35 focus:border-foil-light focus:outline-none"
                        style={{ fontSize: 'clamp(17px, 5.6cqw, 20px)' }}
                      />
                      <button type="submit" disabled={checking} className="ty-cta mt-[1.15em] w-full py-[0.85em] disabled:opacity-60" style={{ fontSize: 'clamp(11px, 3.6cqw, 13px)' }}>
                        {checking ? 'Finding you…' : 'Open my card'}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Flap: velvet outside, gold-foil liner inside */}
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
          {/* the flap's shadow on the envelope, and its foil edge */}
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
            <polyline points="0,0 50,100 100,0" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="5" vectorEffect="non-scaling-stroke" transform="translate(0 1.2)" />
            <polyline points="0.4,0 50,99.3 99.6,0" fill="none" stroke="rgba(201,169,97,0.62)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
              background: 'linear-gradient(162deg, #F1DFB0 0%, #DCC184 26%, #C09A55 55%, #9B7536 82%, #8C6A2F 100%)',
            }}
          >
            {/* damask: tiny engraved florets */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.16]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22'%3E%3Cg fill='none' stroke='%23432808' stroke-width='0.7'%3E%3Cpath d='M11 4c2 3 2 5 0 7-2-2-2-4 0-7z'/%3E%3Cpath d='M11 18c-2-3-2-5 0-7 2 2 2 4 0 7z'/%3E%3Cpath d='M4 11c3-2 5-2 7 0-2 2-4 2-7 0z'/%3E%3Cpath d='M18 11c-3 2-5 2-7 0 2-2 4-2 7 0z'/%3E%3C/g%3E%3C/svg%3E\")",
                backgroundSize: '22px 22px',
              }}
            />
            <div aria-hidden="true" className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(115deg, transparent 28%, rgba(255,255,255,0.7) 48%, transparent 66%)' }} />
            {open && greetingName && (
              <motion.p
                className="absolute inset-x-0 text-center font-script"
                style={{
                  top: '50%',
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

        {/* Seal → Ganesha emblem at the flap's point */}
        <div className="absolute left-1/2 z-30 -translate-x-1/2 -translate-y-1/2" style={{ top: `${FLAP * 100}%` }}>
          <AnimatePresence mode="wait">
            {sealed && <WaxSeal key="seal" onClick={onSealClick} />}
            {naming && (
              <motion.div
                key="ganesha"
                className="flex items-center justify-center rounded-full"
                style={{ width: 'clamp(66px, 21cqw, 80px)', height: 'clamp(66px, 21cqw, 80px)', background: 'radial-gradient(circle, #141011 56%, rgba(20,16,17,0) 71%)' }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <GoldGanesha size="clamp(46px, 14.5cqw, 56px)" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hints and suggestions sit below the envelope, never over it */}
      <AnimatePresence>
        {naming && (error || suggestions.length > 0) && (
          <motion.div
            key="help"
            className="absolute inset-x-0 top-full z-30 mt-5 text-center"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            role="alert"
          >
            {error && <p className="font-display text-[15px] italic leading-snug text-blush-200/90">{error}</p>}
            {suggestions.length > 0 && (
              <div className="mt-3 flex flex-col items-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setName(s);
                      const m = matchGuest(s);
                      if (m.status === 'exact') accept(m);
                    }}
                    className="ty-link text-[17px]"
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
