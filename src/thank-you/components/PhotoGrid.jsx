import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useImageRetry } from '../retry';

// Target row height and gaps, by the grid's width. Roomy for the highlights,
// dense for a whole chapter.
const DENSITY = {
  roomy: (w) => (w < 640 ? [250, 12, 16] : w < 1024 ? [320, 20, 28] : [400, 28, 36]),
  dense: (w) => (w < 640 ? [150, 4, 4] : w < 1024 ? [200, 6, 6] : [240, 8, 8]),
};

/**
 * Justified rows: every photo whole (nothing cropped), each row filled edge to
 * edge, the order kept. A row closes at whichever height is nearer the
 * target, and is never taller than `max`.
 */
function layoutRows(photos, width, [target, gx, gy], max = Infinity) {
  const rows = [];
  let top = 0;
  let row = [];
  let sum = 0; // the row's aspect ratios added up
  const heightOf = (n, aspects) => (width - gx * (n - 1)) / aspects;
  const close = (h) => {
    let x = 0;
    const items = row.map((i) => {
      const w = (photos[i].w / photos[i].h) * h;
      const item = { i, x, w };
      x += w + gx;
      return item;
    });
    rows.push({ top, h, items });
    top += h + gy;
    row = [];
    sum = 0;
  };
  for (let i = 0; i < photos.length; i++) {
    const a = photos[i].w / photos[i].h;
    if (row.length) {
      const hWith = heightOf(row.length + 1, sum + a);
      if (hWith < target) {
        const hWithout = heightOf(row.length, sum);
        if (hWithout - target <= target - hWith && hWithout <= max) close(hWithout);
        else {
          row.push(i);
          sum += a;
          close(hWith);
          continue;
        }
      }
    }
    row.push(i);
    sum += a;
    const h = heightOf(row.length, sum);
    if (h <= target) close(h);
  }
  if (row.length) {
    const h = heightOf(row.length, sum);
    close(Math.min(h <= target * 1.25 ? h : target, max)); // a short last row keeps the usual height
  }
  return { rows, height: Math.max(0, top - gy) };
}

// first row reaching below y / last row starting above y
function firstBelow(rows, y) {
  let lo = 0;
  let hi = rows.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (rows[mid].top + rows[mid].h < y) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
function lastAbove(rows, y) {
  let lo = 0;
  let hi = rows.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (rows[mid].top <= y) lo = mid + 1;
    else hi = mid;
  }
  return lo; // exclusive
}

// Rows aim lower when there's little room under the bars (a phone held
// sideways), and are never taller than that room
const capTarget = (h, base, clear) => (h > 0 ? Math.min(base, Math.max(110, Math.round((h - clear) * 0.88))) : base);
const roomFor = (h, clear) => (h > 0 ? Math.max(110, h - clear - 8) : Infinity);

// the gallery panel, which scrolls (not the page)
const scrollerOf = (el) => el?.closest('[data-gallery-scroller]') ?? null;

// Mark an image that is already there; and when it leaves the page before it
// has arrived (scrolled past), stop its download so it doesn't hold up the
// photos the guest stops at
const imageRef = (img) => {
  if (!img) return undefined;
  if (img.complete && img.naturalWidth > 0) img.dataset.loaded = '';
  return () => {
    if (!img.complete) {
      img.removeAttribute('srcset');
      img.src = 'data:,';
    }
  };
};

// Small tiles ask for no more than twice their size: on a 3x phone screen the
// difference can't be seen, and a long chapter loads a third of the bytes
const slotFor = (w, dense) => `${Math.ceil(dense ? w * Math.min(1, 2 / (window.devicePixelRatio || 1)) : w)}px`;

function Tile({ photo, index, total, x, w, h, dense, focusable, load, onOpen }) {
  const { failed, key, onError } = useImageRetry();
  const [had, setHad] = useState(false); // once here, it stays while the row does
  return (
    <button
      type="button"
      data-photo={index}
      tabIndex={focusable ? 0 : -1}
      onClick={() => onOpen(index)}
      className="ty-tile absolute top-0 overflow-hidden focus:outline-none"
      style={{ left: x, width: w, height: h, backgroundColor: photo.shade }}
      aria-label={photo.alt ? `View photo: ${photo.alt}` : `View photo ${index + 1} of ${total}`}
    >
      {(load || had) && !failed && (
        <img
          key={key}
          ref={imageRef}
          src={photo.md}
          srcSet={photo.srcSet}
          sizes={slotFor(w, dense)}
          alt=""
          decoding="async"
          draggable={false}
          onLoad={(e) => {
            e.currentTarget.dataset.loaded = '';
            setHad(true);
          }}
          onError={onError}
          className="h-full w-full object-cover"
        />
      )}
    </button>
  );
}

/**
 * Photos in justified rows. Only the rows near the screen are in the page, so
 * a chapter of hundreds of photos stays light; images load as rows arrive.
 * `offset` numbers this grid's photos within the tab (the highlights are
 * split into sections). `clear` is the height of the sticky bars over the top
 * of the scrolling panel. `reveal` = { index } scrolls that photo into view.
 */
export function PhotoGrid({ photos, offset = 0, total, density, clear = 0, onOpen, reveal }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [viewH, setViewH] = useState(0);
  // rows in the page [from, to), and the first row reaching below the bars
  const [range, setRange] = useState([0, 0, 0]);
  // rows whose photos may load [from, to): where the guest is looking, once
  // they slow down (a quick fling past a hundred rows downloads nothing)
  const [loadRange, setLoadRange] = useState([0, 0]);
  const pace = useRef({ y: 0, t: 0, timer: 0 });
  // the photo at the top of what the guest sees, kept up to date while
  // scrolling: when the width changes (a phone turned), it stays in place
  const anchor = useRef(null);
  // set when the window changes size: until the rows are re-laid, scrolling
  // must not move the anchor (the header has re-flowed, the rows not yet)
  const frozen = useRef(0);
  const laidOut = useRef(null);

  const [base, gx, gy] = DENSITY[density](width);
  const target = capTarget(viewH, base, clear);
  const room = roomFor(viewH, clear);

  useLayoutEffect(() => {
    const el = ref.current;
    let lastW = el.clientWidth;
    let lastWinW = window.innerWidth;
    setWidth(lastW);
    setViewH(scrollerOf(el)?.clientHeight || window.innerHeight);
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (w === lastW) return;
      lastW = w;
      frozen.current = performance.now();
      setWidth(w);
    });
    ro.observe(el);
    // the room under the bars: the tallest seen at this width, so a phone's
    // toolbar sliding away and back doesn't re-lay the rows while scrolling
    const onResize = () => {
      frozen.current = performance.now();
      const h = scrollerOf(el)?.clientHeight || window.innerHeight;
      const turned = window.innerWidth !== lastWinW;
      lastWinW = window.innerWidth;
      setViewH((old) => (turned ? h : Math.max(old, h)));
    };
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const layout = useMemo(() => (width > 0 ? layoutRows(photos, width, [target, gx, gy], room) : { rows: [], height: 0 }), [photos, width, target, gx, gy, room]);

  // which rows are near the screen (a screen and a half above, two and a half
  // below), which reach below the bars, and the photo at the top of the view
  const measure = useCallback(() => {
    const el = ref.current;
    const sc = scrollerOf(el);
    if (!el || !sc) return;
    const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top;
    const vh = sc.clientHeight || window.innerHeight;
    const line = clear - top; // the bars' lower edge, in this grid
    const from = firstBelow(layout.rows, -top - vh * 1.5);
    const to = lastAbove(layout.rows, -top + vh * 2.5);
    const below = firstBelow(layout.rows, line + 1);
    const want = [firstBelow(layout.rows, -top - vh * 0.5), lastAbove(layout.rows, -top + vh * 1.75)];
    const apply = () => setLoadRange((r) => (r[0] === want[0] && r[1] === want[1] ? r : want));
    const p = pace.current;
    const now = performance.now();
    const speed = p.t ? Math.abs(-top - p.y) / Math.max(1, now - p.t) : 0; // px per ms
    p.y = -top;
    p.t = now;
    window.clearTimeout(p.timer);
    if (speed < (vh * 2) / 1000) apply(); // under two screens a second: load as we go
    else p.timer = window.setTimeout(apply, 160); // flinging: wait until it slows
    if (frozen.current && performance.now() - frozen.current > 1500) frozen.current = 0; // never stuck
    if (!frozen.current) {
      const row = layout.rows[below];
      anchor.current = line >= 0 && line < layout.height && row ? { i: row.items[0].i, by: row.top - line } : null;
    }
    setRange((r) => (r[0] === from && r[1] === to && r[2] === below ? r : [from, to, below]));
  }, [layout, clear]);

  // after the rows change size (a new width, or the room under the bars),
  // put the anchored photo back where it was
  useLayoutEffect(() => {
    const changed = laidOut.current !== null && laidOut.current !== layout;
    laidOut.current = layout;
    const a = changed ? anchor.current : null;
    frozen.current = 0;
    const el = ref.current;
    const sc = scrollerOf(el);
    const row = a && layout.rows.find((r) => r.items.some((it) => it.i === a.i));
    if (row && el && sc) {
      const line = clear - (el.getBoundingClientRect().top - sc.getBoundingClientRect().top);
      sc.scrollTo(0, sc.scrollTop + row.top - a.by - line);
    }
    measure();
  }, [layout, measure, clear]);

  useEffect(() => () => window.clearTimeout(pace.current.timer), []);

  useEffect(() => {
    const sc = scrollerOf(ref.current);
    if (!sc) return undefined;
    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = window.requestAnimationFrame(() => {
          raf = 0;
          measure();
        });
    };
    sc.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.cancelAnimationFrame(raf);
      sc.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [measure]);

  // bring a photo into view (the one last shown in the viewer), once: a later
  // re-layout must not pull the page back to it
  const revealed = useRef(null);
  useLayoutEffect(() => {
    if (!reveal || revealed.current === reveal) return;
    const local = reveal.index - offset;
    const row = layout.rows.find((r) => r.items.some((it) => it.i === local));
    const el = ref.current;
    const sc = scrollerOf(el);
    if (!row || !el || !sc) return; // not in this grid, or not laid out yet
    revealed.current = reveal;
    const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + row.top;
    if (top < clear || top + row.h > sc.clientHeight) sc.scrollTo(0, sc.scrollTop + top - Math.max(clear, (sc.clientHeight - row.h) / 2));
    measure();
  }, [reveal, offset, layout, measure, clear]);

  const shown = layout.rows.slice(range[0], range[1]);
  return (
    <div ref={ref} data-grid="" className="relative w-full" style={{ height: layout.height }}>
      {shown.map((row, k) => {
        const n = range[0] + k;
        return (
          <div key={n} className="absolute inset-x-0" style={{ top: row.top, height: row.h }}>
            {row.items.map(({ i, x, w }) => (
              <Tile
                key={photos[i].id}
                photo={photos[i]}
                index={offset + i}
                total={total}
                x={x}
                w={w}
                h={row.h}
                dense={density === 'dense'}
                focusable={n >= range[2]}
                load={n >= loadRange[0] && n < loadRange[1]}
                onOpen={onOpen}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
