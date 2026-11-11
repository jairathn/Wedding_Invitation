import { motion } from 'framer-motion';
import { useImageRetry } from '../retry';

// 35mm perforations: rounded holes every 17px, drawn once and tiled
const PERFS =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='17' height='6'%3E%3Crect x='4.25' y='0.25' width='8.5' height='5.5' rx='1.6' fill='%230B0509' fill-opacity='0.9' stroke='%23F4EDE3' stroke-opacity='0.16' stroke-width='0.5'/%3E%3C/svg%3E\")";
const FADE = 'linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)';
const MIN_FRAMES = 48; // enough to cover a 2560px screen before the loop repeats

// A frame's photo: hidden until it arrives, so a failed one leaves a dark
// frame rather than a broken-image icon, and tried again later
function FrameImage({ photo }) {
  const { failed, key, onError } = useImageRetry();
  if (failed) return null;
  return (
    <img
      key={key}
      src={photo.sm}
      alt=""
      loading="lazy"
      decoding="async"
      onLoad={(e) => {
        e.currentTarget.dataset.loaded = '';
      }}
      onError={onError}
      className="film-frame h-full w-full object-cover opacity-0 transition duration-700 ease-out group-hover:scale-[1.04] data-[loaded]:opacity-[0.72] group-hover:data-[loaded]:opacity-100 group-focus-visible:data-[loaded]:opacity-100"
    />
  );
}

function Strip({ items, direction, secondsPerFrame, onOpen, numberFrom, quiet }) {
  const reps = Math.max(1, Math.ceil(MIN_FRAMES / items.length));
  const set = Array.from({ length: reps }, () => items).flat();
  const loop = [...set, ...set];

  return (
    <div className="film-strip relative w-full overflow-hidden" style={{ height: 'var(--strip-h)', overflow: 'clip', WebkitMaskImage: FADE, maskImage: FADE }}>
      <div
        className="film-track absolute inset-y-0 left-0 flex w-max"
        style={{
          animationName: direction === 'left' ? 'strip-left' : 'strip-right',
          animationDuration: `${set.length * secondsPerFrame}s`,
          animationPlayState: quiet ? 'paused' : undefined,
          background: 'linear-gradient(180deg, rgba(20,13,10,0.92) 0%, rgba(14,9,8,0.9) 50%, rgba(20,13,10,0.92) 100%)',
          paddingBlock: 'var(--band)',
        }}
      >
        {/* perforation rows travel with the frames */}
        <div aria-hidden="true" className="absolute inset-x-0 top-[3px] h-[6px]" style={{ backgroundImage: PERFS, backgroundRepeat: 'repeat-x' }} />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[3px] h-[6px]" style={{ backgroundImage: PERFS, backgroundRepeat: 'repeat-x' }} />

        {loop.map((photo, i) => {
          const n = numberFrom + (i % set.length);
          return (
            <button
              key={`${photo.id}-${i}`}
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()} // keep focus where it was; the strip never holds it
              onClick={() => onOpen(photo.index)}
              className="group relative h-full flex-shrink-0 px-[3px] focus:outline-none"
            >
              <span className="relative block h-full overflow-hidden bg-black" style={{ aspectRatio: `${photo.w} / ${photo.h}` }}>
                <FrameImage photo={photo} />
                <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_12px_rgba(0,0,0,0.6)] group-focus-visible:shadow-[inset_0_0_0_2px_rgba(241,223,176,0.9)]" aria-hidden="true" />
              </span>
              {/* edge print */}
              <span
                aria-hidden="true"
                className="film-edge-print pointer-events-none absolute left-[6px] font-mono leading-none text-ember/60"
                style={{ bottom: 'calc(var(--band) - 10px)', fontSize: '7px', letterSpacing: '0.08em' }}
              >
                {n % 2 ? `▸${Math.ceil(n / 2)}A` : Math.ceil(n / 2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Film strips of wedding photos laid under the card, above and below it.
 * They are a pointer shortcut into the gallery; keyboard and screen-reader
 * guests reach the same photos through the card's "Our photographs".
 */
export function FilmStrips({ show, quiet = false, photos, onOpen }) {
  if (!show || !photos.length) return null; // mount (and load thumbnails) only once the card is open
  const indexed = photos.map((p, index) => ({ ...p, index }));
  // alternate photos between the strips so neighbours differ
  const top = indexed.filter((_, i) => i % 2 === 0);
  const bottom = indexed.filter((_, i) => i % 2 === 1);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[calc(100*var(--vh))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: quiet ? 0.45 : 1 }}
      transition={{ duration: quiet ? 0.8 : 2, ease: 'easeInOut' }}
    >
      <div className="ty-strip ty-strip-top pointer-events-auto absolute" style={{ transform: 'rotate(-0.8deg)' }}>
        <Strip items={top.length ? top : indexed} direction="left" secondsPerFrame={11} onOpen={onOpen} numberFrom={12} quiet={quiet} />
      </div>
      <div className="ty-strip ty-strip-bottom pointer-events-auto absolute" style={{ transform: 'rotate(0.6deg)' }}>
        <Strip items={bottom.length ? bottom : indexed} direction="right" secondsPerFrame={12} onOpen={onOpen} numberFrom={1} quiet={quiet} />
      </div>
    </motion.div>
  );
}
