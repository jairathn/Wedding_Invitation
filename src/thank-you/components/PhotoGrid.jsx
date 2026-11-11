import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

// Target row height and gaps, by the grid's width. Roomy for the highlights,
// dense for a whole chapter.
const DENSITY = {
  roomy: (w) => (w < 640 ? [250, 12, 16] : w < 1024 ? [320, 20, 28] : [400, 28, 36]),
  dense: (w) => (w < 640 ? [150, 4, 4] : w < 1024 ? [200, 6, 6] : [240, 8, 8]),
};

/**
 * Justified rows: every photo whole (nothing cropped), each row filled edge to
 * edge, the order kept. A row closes at whichever height is nearer the target.
 */
function layoutRows(photos, width, [target, gx, gy]) {
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
        if (hWithout - target <= target - hWith) close(hWithout);
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
    close(h <= target * 1.25 ? h : target); // a short last row keeps the usual height
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

// the gallery panel, which scrolls (not the page)
const scrollerOf = (el) => el?.closest('[data-gallery-scroller]') ?? null;

const markLoaded = (img) => {
  if (img && img.complete && img.naturalWidth > 0) img.dataset.loaded = '';
};

// Small tiles ask for no more than twice their size: on a 3x phone screen the
// difference can't be seen, and a long chapter loads a third of the bytes
const slotFor = (w, dense) => `${Math.ceil(dense ? w * Math.min(1, 2 / (window.devicePixelRatio || 1)) : w)}px`;

function Tile({ photo, index, total, x, w, h, dense, onOpen }) {
  return (
    <button
      type="button"
      data-photo={index}
      onClick={() => onOpen(index)}
      className="ty-tile absolute top-0 overflow-hidden focus:outline-none"
      style={{ left: x, width: w, height: h, backgroundColor: photo.shade }}
      aria-label={photo.alt ? `View photo: ${photo.alt}` : `View photo ${index + 1} of ${total}`}
    >
      <img
        ref={markLoaded}
        src={photo.md}
        srcSet={photo.srcSet}
        sizes={slotFor(w, dense)}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        onLoad={(e) => {
          e.currentTarget.dataset.loaded = '';
        }}
        className="h-full w-full object-cover"
      />
    </button>
  );
}

/**
 * Photos in justified rows. Only the rows near the screen are in the page, so
 * a chapter of hundreds of photos stays light; images load as rows arrive.
 * `offset` numbers this grid's photos within the tab (the highlights are
 * split into sections). `reveal` = { index, clear } scrolls that photo into
 * view, clear of the sticky bars.
 */
export function PhotoGrid({ photos, offset = 0, total, density, onOpen, reveal }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [range, setRange] = useState([0, 0]);
  const layoutRef = useRef(null);
  const anchor = useRef(null);

  // When the width changes (a phone turned sideways), note the photo at the
  // top of the screen so it can stay there once the rows are re-laid
  useLayoutEffect(() => {
    const el = ref.current;
    let last = el.clientWidth;
    setWidth(last);
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (w === last) return;
      last = w;
      const sc = scrollerOf(el);
      const old = layoutRef.current;
      if (sc && old?.rows.length) {
        const y = sc.getBoundingClientRect().top - el.getBoundingClientRect().top;
        if (y > 0 && y < old.height) {
          const row = old.rows[Math.min(firstBelow(old.rows, y), old.rows.length - 1)];
          anchor.current = { i: row.items[0].i, by: row.top - y };
        }
      }
      setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [target, gx, gy] = DENSITY[density](width);
  const layout = useMemo(() => (width > 0 ? layoutRows(photos, width, [target, gx, gy]) : { rows: [], height: 0 }), [photos, width, target, gx, gy]);

  // which rows are near the screen: a screen and a half above, two and a half below
  const measure = useCallback(() => {
    const el = ref.current;
    const sc = scrollerOf(el);
    if (!el || !sc) return;
    const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top;
    const vh = sc.clientHeight || window.innerHeight;
    const from = firstBelow(layout.rows, -top - vh * 1.5);
    const to = lastAbove(layout.rows, -top + vh * 2.5);
    setRange((r) => (r[0] === from && r[1] === to ? r : [from, to]));
  }, [layout]);

  useLayoutEffect(() => {
    layoutRef.current = layout;
    const a = anchor.current;
    anchor.current = null;
    const el = ref.current;
    const sc = scrollerOf(el);
    const row = a && layout.rows.find((r) => r.items.some((it) => it.i === a.i));
    if (row && sc) {
      const y = sc.getBoundingClientRect().top - el.getBoundingClientRect().top;
      sc.scrollTo(0, sc.scrollTop + row.top - a.by - y);
    }
    measure();
  }, [layout, measure]);

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
  // re-layout (a phone turned sideways) must not pull the page back to it
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
    const clear = reveal.clear ?? 0; // the sticky bars at the top
    if (top < clear || top + row.h > sc.clientHeight) sc.scrollTo(0, sc.scrollTop + top - Math.max(clear, (sc.clientHeight - row.h) / 2));
    measure();
  }, [reveal, offset, layout, measure]);

  const shown = layout.rows.slice(range[0], range[1]);
  return (
    <div ref={ref} className="relative w-full" style={{ height: layout.height }}>
      {shown.map((row, k) => (
        <div key={range[0] + k} className="absolute inset-x-0" style={{ top: row.top, height: row.h }}>
          {row.items.map(({ i, x, w }) => (
            <Tile key={photos[i].id} photo={photos[i]} index={offset + i} total={total} x={x} w={w} h={row.h} dense={density === 'dense'} onOpen={onOpen} />
          ))}
        </div>
      ))}
    </div>
  );
}
