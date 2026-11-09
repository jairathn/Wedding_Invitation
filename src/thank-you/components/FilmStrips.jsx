import { motion } from 'framer-motion';

// 35mm perforations: rounded holes every 17px, drawn once and tiled
const PERFS =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='17' height='6'%3E%3Crect x='4' y='0' width='9' height='6' rx='1.7' fill='%23F4EDE3' fill-opacity='0.2'/%3E%3C/svg%3E\")";
const FADE = 'linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)';
const MIN_FRAMES = 48; // enough to cover a 2560px screen before the loop repeats

function Strip({ items, direction, secondsPerFrame, onOpen, label, numberFrom }) {
  const reps = Math.max(1, Math.ceil(MIN_FRAMES / items.length));
  const set = Array.from({ length: reps }, () => items).flat();
  const loop = [...set, ...set];

  return (
    <div
      className="film-strip relative w-full overflow-hidden"
      style={{ height: 'var(--strip-h)', WebkitMaskImage: FADE, maskImage: FADE }}
      role="region"
      aria-label={label}
    >
      <div
        className="film-track absolute inset-y-0 left-0 flex w-max"
        style={{
          animationName: direction === 'left' ? 'strip-left' : 'strip-right',
          animationDuration: `${set.length * secondsPerFrame}s`,
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
              tabIndex={i < set.length ? 0 : -1}
              aria-hidden={i >= set.length ? 'true' : undefined}
              onClick={() => onOpen(photo.index)}
              className="group relative h-full flex-shrink-0 px-[3px] focus:outline-none"
              aria-label={photo.alt ? `Open photo: ${photo.alt}` : 'Open photo'}
            >
              <span className="relative block h-full overflow-hidden bg-black" style={{ aspectRatio: `${photo.w} / ${photo.h}` }}>
                <img
                  src={photo.sm}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover opacity-[0.82] transition duration-700 ease-out group-hover:scale-[1.05] group-hover:opacity-100 group-focus-visible:opacity-100"
                />
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

/** Film strips of wedding photos above and below the card. */
export function FilmStrips({ show, photos, onOpen }) {
  if (!show || !photos.length) return null; // mount (and load thumbnails) only once the card is open
  const indexed = photos.map((p, index) => ({ ...p, index }));
  // alternate photos between the strips so neighbours differ
  const top = indexed.filter((_, i) => i % 2 === 0);
  const bottom = indexed.filter((_, i) => i % 2 === 1);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[2]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: 'easeInOut' }}
    >
      <div className="ty-strip-top pointer-events-auto absolute inset-x-0" style={{ top: 'var(--strip-top)' }}>
        <Strip items={top.length ? top : indexed} direction="left" secondsPerFrame={6.5} onOpen={onOpen} label="Wedding photos" numberFrom={12} />
      </div>
      <div className="pointer-events-auto absolute inset-x-0" style={{ bottom: 'var(--strip-bottom)' }}>
        <Strip items={bottom.length ? bottom : indexed} direction="right" secondsPerFrame={7} onOpen={onOpen} label="More wedding photos" numberFrom={1} />
      </div>
    </motion.div>
  );
}
