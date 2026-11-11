#!/usr/bin/env node
/**
 * Image pipeline for the thank-you site.
 *
 *   node scripts/process-photos.mjs hero
 *     Builds the night background (landscape bottom-half crop + full portrait),
 *     the social-share image, and prints tiny blur placeholders.
 *
 *   node scripts/process-photos.mjs gallery <folder-or-photo-or-zip> [...]
 *     Turns the photographer's exports into web sizes
 *     (public/photos/<id>-{sm,md,lg}.webp) and adds them to the gallery manifest
 *     (src/thank-you/data/photos.json). Zip files (as made by the photo
 *     packer) are unpacked to a temporary folder. When two inputs share a
 *     name, the larger original wins. Photos already in the manifest stay
 *     (as long as their web files are there), so photos can be added a few at
 *     a time.
 *
 *     The manifest is safe to edit by hand, and re-running keeps the edits:
 *       chapter   the gallery section (tab) a photo sits in; new photos get one
 *                 from their file name (see CHAPTERS)
 *       featured  true for the highlights: the film strips and the gallery's
 *                 first tab
 *       seq       a number to move a photo ahead within its chapter (photos
 *                 without one follow, in the photographer's file order)
 *       alt       a caption / description
 *       excluded  (top level) source file names to leave out, e.g. duplicates
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HERO_SRC = path.join(ROOT, 'source-media/photos/shriyaneil_wedding0594.jpg');
const HERO_OUT = path.join(ROOT, 'public/images/thank-you');
// Overridable for dry runs: PHOTOS_OUT_DIR=/tmp/x PHOTOS_MANIFEST=/tmp/x.json
const PHOTO_OUT = process.env.PHOTOS_OUT_DIR || path.join(ROOT, 'public/photos');
const MANIFEST = process.env.PHOTOS_MANIFEST || path.join(ROOT, 'src/thank-you/data/photos.json');

// Long-edge sizes for gallery photos: film strips and small grid tiles, grid
// tiles, the full-screen viewer. Kept modest: there are over a thousand photos.
const SIZES = { sm: 480, md: 960, lg: 1600 };
const QUALITY = { sm: 72, md: 72, lg: 76 };

// Gallery chapters in order, and how a file name places a new photo in one
const CHAPTERS = [
  ['Haldi', /haldi/i],
  ['Sangeet', /sangeet/i],
  ['The Wedding', /wedding/i],
  ['On Film', /^\d{2}_\d{2}_\d{4}_/], // film scans, named by the lab's scanner
];
const chapterFor = (name) => CHAPTERS.find(([, re]) => re.test(name))?.[0] ?? null;
const chapterRank = (name) => {
  const i = CHAPTERS.findIndex(([c]) => c === name);
  return i < 0 ? CHAPTERS.length : i;
};

// Ruben's "preview" (sneak-peek) set repeats photos from the wedding set
const SKIP = [/_preview\d/i];

async function hero() {
  await fs.mkdir(HERO_OUT, { recursive: true });
  const meta = await sharp(HERO_SRC).metadata();
  const { width: W, height: H } = meta;

  // Landscape: the bottom half of the portrait photo (couple, fountain
  // fireworks, guests). 4:3, so `object-fit: cover` can serve 4:3..21:9.
  const land = { left: 0, top: Math.round(H / 2), width: W, height: H - Math.round(H / 2) };
  for (const w of [1280, 1920, 2560]) {
    const base = sharp(HERO_SRC).extract(land).resize({ width: w });
    await base.clone().webp({ quality: 78, effort: 6 }).toFile(`${HERO_OUT}/hero-landscape-${w}.webp`);
    await base.clone().jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(`${HERO_OUT}/hero-landscape-${w}.jpg`);
  }
  // Portrait: the full frame for phones.
  for (const w of [750, 1125, 1500]) {
    const base = sharp(HERO_SRC).resize({ width: w });
    await base.clone().webp({ quality: 78, effort: 6 }).toFile(`${HERO_OUT}/hero-portrait-${w}.webp`);
    await base.clone().jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(`${HERO_OUT}/hero-portrait-${w}.jpg`);
  }
  // Social share card (1200x630) centred on the dip + fountain.
  const ogH = Math.round(W * (630 / 1200));
  await sharp(HERO_SRC)
    .extract({ left: 0, top: Math.min(H - ogH, Math.round(H * 0.625)), width: W, height: ogH })
    .resize(1200, 630)
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(`${HERO_OUT}/og-image.jpg`);

  const lqip = async (pipeline) =>
    'data:image/jpeg;base64,' + (await pipeline.resize({ width: 24 }).blur(1.2).jpeg({ quality: 50 }).toBuffer()).toString('base64');
  console.log('landscape LQIP:', await lqip(sharp(HERO_SRC).extract(land)));
  console.log('portrait LQIP:', await lqip(sharp(HERO_SRC)));
  console.log(`hero assets written to ${path.relative(ROOT, HERO_OUT)}`);
}

const naturalKey = (s) => s.replace(/\d+/g, (d) => d.padStart(8, '0')).toLowerCase();
const slugify = (s) => s.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const IMAGE_RE = /\.(jpe?g|png|webp|tiff?)$/i;

const ZIP_RE = /\.zip$/i;

// Image files under a folder, at any depth (zips may hold a folder)
async function imagesIn(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('__MACOSX')) out.push(...(await imagesIn(p)));
    else if (entry.isFile() && IMAGE_RE.test(entry.name) && !entry.name.startsWith('._')) out.push(p);
  }
  return out;
}

// Unpack a zip into a temporary folder (removed by the caller when done)
async function unzipToTemp(zip, temps) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'photos-'));
  temps.push(dir);
  try {
    execFileSync('unzip', ['-q', '-o', zip, '-d', dir], { stdio: ['ignore', 'ignore', 'inherit'] });
  } catch (err) {
    throw new Error(`could not unpack ${zip} (is the unzip command installed?): ${err.message}`);
  }
  return imagesIn(dir);
}

async function listInputs(inputs, temps) {
  const files = [];
  for (const input of inputs) {
    const stat = await fs.stat(input);
    const entries = stat.isDirectory() ? (await fs.readdir(input)).sort().map((f) => path.join(input, f)) : [input];
    for (const f of entries) {
      if (IMAGE_RE.test(f)) files.push(f);
      else if (ZIP_RE.test(f)) files.push(...(await unzipToTemp(f, temps)));
    }
  }
  return files;
}

// Decode with EXIF orientation applied, then drop a thin white print margin
// (film scans arrive as a black film frame on a white border). The trim is
// only kept when it removes a border, never when it would eat into a bright
// photo edge.
async function decodeTrimmed(file) {
  const { data, info } = await sharp(file).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const raw = { raw: { width: info.width, height: info.height, channels: info.channels } };
  try {
    const t = await sharp(data, raw).trim({ background: '#ffffff', threshold: 30 }).raw().toBuffer({ resolveWithObject: true });
    const left = -(t.info.trimOffsetLeft || 0);
    const top = -(t.info.trimOffsetTop || 0);
    const right = info.width - t.info.width - left;
    const bottom = info.height - t.info.height - top;
    // A print margin surrounds the whole frame: all four sides trimmed, none
    // by much. A digital photo with one bright edge (sky, a white wall) only
    // loses a side or two, and is left alone.
    const margin = (px, dim) => px >= 4 && px <= dim * 0.04;
    if (margin(left, info.width) && margin(right, info.width) && margin(top, info.height) && margin(bottom, info.height)) {
      // Scans sit slightly askew, so the margin is wedge-shaped and a
      // bounding-box trim leaves white slivers. Shave a little more; the
      // black film frame (~3% thick) absorbs it.
      const shave = Math.round(Math.min(t.info.width, t.info.height) * 0.012);
      const width = t.info.width - shave * 2;
      const height = t.info.height - shave * 2;
      const shaved = await sharp(t.data, { raw: { width: t.info.width, height: t.info.height, channels: t.info.channels } })
        .extract({ left: shave, top: shave, width, height })
        .raw()
        .toBuffer({ resolveWithObject: true });
      return { data: shaved.data, raw: { raw: { width, height, channels: shaved.info.channels } }, width, height };
    }
  } catch {
    /* uniform image or trim unsupported: keep as is */
  }
  return { data, raw, width: info.width, height: info.height };
}

async function gallery(inputs) {
  if (!inputs.length) throw new Error('usage: node scripts/process-photos.mjs gallery <folder-or-photo-or-zip> [...]');
  const temps = [];
  try {
    await galleryFrom(await listInputs(inputs, temps), inputs);
  } finally {
    for (const dir of temps) await fs.rm(dir, { recursive: true, force: true });
  }
}

const ABOUT =
  'Generated by scripts/process-photos.mjs; one photo per line, in gallery order. Safe to edit chapter/featured/seq/alt by hand, and the excluded list; re-running keeps them.';

const webFiles = (id) => Object.keys(SIZES).map((key) => path.join(PHOTO_OUT, `${id}-${key}.webp`));
const exists = (f) =>
  fs.access(f).then(
    () => true,
    () => false,
  );
const hex = (n) => Math.round(n).toString(16).padStart(2, '0');

// Run `task` over `items`, a few at a time (each WebP encode uses one core)
async function pool(items, size, task) {
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      await task(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
}

async function encode(file) {
  const base = path.basename(file);
  const id = slugify(base);
  const img = await decodeTrimmed(file);
  const { width: w0, height: h0 } = img;
  for (const [key, edge] of Object.entries(SIZES)) {
    await sharp(img.data, img.raw)
      .resize({ width: w0 >= h0 ? edge : null, height: h0 > w0 ? edge : null, withoutEnlargement: true })
      .webp({ quality: QUALITY[key], effort: 5 })
      .toFile(path.join(PHOTO_OUT, `${id}-${key}.webp`));
  }
  // the photo's average colour, shown in its tile while it loads
  const { channels } = await sharp(img.data, img.raw).stats();
  const scale = Math.min(1, SIZES.lg / Math.max(w0, h0));
  return {
    id,
    w: Math.round(w0 * scale),
    h: Math.round(h0 * scale),
    tone: `#${channels
      .slice(0, 3)
      .map((c) => hex(c.mean))
      .join('')}`,
    source: base,
  };
}

async function galleryFrom(allFiles, inputs) {
  let old = {};
  try {
    old = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));
  } catch {
    old = {};
  }
  const previous = new Map((old.photos || []).map((p) => [p.id, p]));
  const excluded = old.excluded || [];

  // One file per photo: skip excluded names and repeats; when a name comes
  // twice (an original and a packed copy), keep the one with the most pixels
  const skip = new Set(excluded.map((n) => n.toLowerCase()));
  const leftOut = (name) => skip.has(name.toLowerCase()) || SKIP.some((re) => re.test(name));
  const best = new Map();
  for (const file of allFiles) {
    if (leftOut(path.basename(file))) continue;
    const id = slugify(path.basename(file));
    const { width = 0, height = 0 } = await sharp(file).metadata();
    const have = best.get(id);
    if (!have || width * height > have.pixels) best.set(id, { file, pixels: width * height });
  }
  const files = [...best.values()].map((b) => b.file);
  if (!files.length) throw new Error(`no images found in ${inputs.join(', ')}`);
  await fs.mkdir(PHOTO_OUT, { recursive: true });

  const made = new Map();
  let done = 0;
  await pool(files, Math.max(1, Math.min(4, os.cpus().length)), async (file) => {
    const photo = await encode(file);
    made.set(photo.id, photo);
    process.stdout.write(`\r${++done}/${files.length} ${photo.source}`.padEnd(70));
  });

  // New and re-made photos, plus the ones already on the site
  const photos = [];
  for (const [id, prev] of previous) {
    if (made.has(id)) continue;
    if (leftOut(prev.source || '')) continue;
    if ((await Promise.all(webFiles(id).map(exists))).every(Boolean)) photos.push(prev);
    else console.warn(`\nleaving out ${id}: its web files are missing from ${path.relative(ROOT, PHOTO_OUT)}`);
  }
  for (const [id, photo] of made) {
    const prev = previous.get(id) || {};
    photos.push({
      id,
      w: photo.w,
      h: photo.h,
      tone: photo.tone,
      chapter: prev.chapter ?? chapterFor(photo.source),
      ...(prev.featured ? { featured: true } : {}),
      ...(prev.alt ? { alt: prev.alt } : {}),
      ...(Number.isFinite(prev.seq) ? { seq: prev.seq } : {}),
      source: photo.source,
    });
  }

  // Chapter by chapter; within one, hand-set places (seq) first, then the
  // photographer's file order (their exports are numbered in shooting order)
  const seqOf = (p) => (Number.isFinite(p.seq) ? p.seq : Infinity);
  photos.sort(
    (a, b) =>
      chapterRank(a.chapter) - chapterRank(b.chapter) ||
      String(a.chapter ?? '').localeCompare(String(b.chapter ?? '')) ||
      seqOf(a) - seqOf(b) ||
      naturalKey(a.source || a.id).localeCompare(naturalKey(b.source || b.id)),
  );
  const text = [
    '{',
    `  "_about": ${JSON.stringify(ABOUT)},`,
    `  "excluded": ${JSON.stringify(excluded)},`,
    '  "photos": [',
    photos.map((p) => `    ${JSON.stringify(p)}`).join(',\n'),
    '  ]',
    '}',
    '',
  ].join('\n');
  await fs.writeFile(MANIFEST, text);
  const featured = photos.filter((p) => p.featured).length;
  console.log(`\n${made.size} photos made, ${photos.length} in the gallery (${featured} featured) -> ${path.relative(ROOT, MANIFEST)}`);
}

const [mode, ...args] = process.argv.slice(2);
if (mode === 'hero') await hero();
else if (mode === 'gallery') await gallery(args);
else {
  console.error('usage: node scripts/process-photos.mjs hero | gallery <folder-or-photo> [...]');
  process.exit(1);
}
