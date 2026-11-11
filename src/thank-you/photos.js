// The gallery's photo list. It is a separate file, fetched only once the card
// is out; the photos themselves load as they come into view.
import manifestUrl from './data/photos.json?url';

// Long edges of the web sizes scripts/process-photos.mjs makes
const SIZES = { sm: 480, md: 960, lg: 1600 };

const widthAt = (p, edge) => Math.round(p.w * Math.min(1, edge / Math.max(p.w, p.h)));

// The photo's own colour, sunk into the night: its tile's colour while it loads
function shade(tone) {
  const m = /^#([0-9a-f]{6})$/i.exec(tone || '');
  if (!m) return '#1A1412';
  const n = parseInt(m[1], 16);
  const mix = (c, base) => Math.round(c * 0.32 + base * 0.68);
  return `rgb(${mix(n >> 16, 10)}, ${mix((n >> 8) & 255, 8)}, ${mix(n & 255, 7)})`;
}

function expand(p) {
  const src = (size) => `/photos/${p.id}-${size}.webp`;
  return {
    ...p,
    shade: shade(p.tone),
    sm: src('sm'),
    md: src('md'),
    lg: src('lg'),
    srcSet: Object.keys(SIZES)
      .map((size) => `${src(size)} ${widthAt(p, SIZES[size])}w`)
      .join(', '),
  };
}

// A failed fetch is forgotten, so the next attempt really tries again
let manifest;
export function loadPhotos() {
  return (manifest ||= fetch(manifestUrl)
    .then((r) => {
      if (!r.ok) throw new Error(`photos: HTTP ${r.status}`);
      return r.json();
    })
    .then((m) => (m.photos || []).filter((p) => p.id && p.w > 0 && p.h > 0).map(expand))
    .catch((err) => {
      manifest = undefined;
      throw err;
    }));
}

/**
 * The gallery's tabs: the highlights (photos marked `featured`) and then one
 * per chapter, in the order the chapters first appear.
 */
export function galleryTabs(photos) {
  const chapters = [];
  const byName = new Map();
  for (const p of photos) {
    const name = p.chapter || 'More photographs';
    if (!byName.has(name)) {
      const chapter = { id: `ch-${chapters.length}`, name, number: chapters.length, photos: [] };
      byName.set(name, chapter);
      chapters.push(chapter);
    }
    byName.get(name).photos.push(p);
  }
  const featured = photos.filter((p) => p.featured);
  if (!featured.length) return chapters;
  // the highlights keep their chapters as sections
  const sections = [];
  featured.forEach((p, i) => {
    const chapter = byName.get(p.chapter || 'More photographs');
    const last = sections[sections.length - 1];
    if (last?.chapter === chapter) last.photos.push(p);
    else sections.push({ chapter, start: i, photos: [p] });
  });
  return [{ id: 'highlights', name: 'Highlights', number: null, photos: featured, sections }, ...chapters];
}
