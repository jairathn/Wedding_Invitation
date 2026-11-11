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
    .then((m) => {
      const list = (m.photos || []).filter((p) => p.id && p.w > 0 && p.h > 0).map(expand);
      if (!list.length) throw new Error('photos: the list is empty');
      return list;
    })
    .catch((err) => {
      manifest = undefined;
      throw err;
    }));
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'more';
const chapterOf = (p) => p.chapter || 'More photographs';

/**
 * The gallery's tabs: the highlights (Ruben's photos marked `featured`), then
 * one per chapter of Ruben's, then one for each other photographer's set
 * (photos with a `set`), split into its own chapters. Tab ids come from the
 * names, so a history entry still finds its chapter after the photos change.
 */
export function galleryTabs(photos, sets = {}) {
  const own = photos.filter((p) => !p.set);
  const chapters = groupBy(own, (name, i) => ({ id: `ch-${slug(name)}`, name, number: i }));
  const tabs = [];
  const featured = own.filter((p) => p.featured);
  if (featured.length) {
    const sections = sectionsOf(featured, chapters);
    tabs.push({ id: 'highlights', name: 'Highlights', number: null, photos: sections.flatMap((s) => s.photos), sections });
  }
  tabs.push(...chapters);
  // other photographers, in the order their photos come
  for (const key of [...new Set(photos.filter((p) => p.set).map((p) => p.set))]) {
    const list = photos.filter((p) => p.set === key);
    const own = groupBy(list, (name) => ({ id: `${key}-${slug(name)}`, name, number: null }));
    const sections = sectionsOf(list, own);
    const about = sets[key] || {};
    tabs.push({
      id: `set-${key}`,
      name: about.name || key,
      by: about.name || key,
      title: about.title || '',
      invite: about.invite || '',
      covers: about.covers || [],
      number: null,
      guest: true,
      photos: sections.flatMap((s) => s.photos),
      sections,
    });
  }
  return tabs;
}

// Chapters in the order they first appear, each with its photos
function groupBy(list, make) {
  const chapters = [];
  const byName = new Map();
  for (const p of list) {
    const name = chapterOf(p);
    if (!byName.has(name)) {
      const chapter = { ...make(name, chapters.length), photos: [] };
      byName.set(name, chapter);
      chapters.push(chapter);
    }
    byName.get(name).photos.push(p);
  }
  return chapters;
}

// A tab's photos as one section per chapter, in chapter order (even if a
// photo's chapter was changed by hand without moving its line)
function sectionsOf(list, chapters) {
  const sections = [];
  let start = 0;
  for (const chapter of chapters) {
    const photos = list.filter((p) => chapterOf(p) === chapter.name);
    if (!photos.length) continue;
    sections.push({ chapter, start, photos });
    start += photos.length;
  }
  return sections;
}
