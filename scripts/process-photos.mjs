#!/usr/bin/env node
/**
 * Image pipeline for the thank-you site.
 *
 *   node scripts/process-photos.mjs hero
 *     Builds the night background (landscape bottom-half crop + full portrait),
 *     the social-share image, and prints tiny blur placeholders.
 *
 *   node scripts/process-photos.mjs gallery <folder-or-photo> [...]
 *     Turns the photographer's full-size exports into web sizes
 *     (public/photos/<id>-{sm,md,lg}.webp) and writes the gallery manifest
 *     (src/thank-you/data/photos.json). Photos are ordered by capture time when
 *     EXIF has it, otherwise by the photographer's file sequence numbers.
 *     Existing chapter/alt/featured edits in the manifest are preserved.
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HERO_SRC = path.join(ROOT, 'source-media/photos/shriyaneil_wedding0594.jpg');
const HERO_OUT = path.join(ROOT, 'public/images/thank-you');
// Overridable for dry runs: PHOTOS_OUT_DIR=/tmp/x PHOTOS_MANIFEST=/tmp/x.json
const PHOTO_OUT = process.env.PHOTOS_OUT_DIR || path.join(ROOT, 'public/photos');
const MANIFEST = process.env.PHOTOS_MANIFEST || path.join(ROOT, 'src/thank-you/data/photos.json');

// Long-edge sizes for gallery photos: film strips, grid, lightbox.
const SIZES = { sm: 480, md: 1024, lg: 2048 };

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

// ---- minimal EXIF DateTimeOriginal reader (avoids an extra dependency) ----
function exifDate(buf) {
  if (!buf) return null;
  let o = buf.indexOf('Exif\0\0') === 0 ? 6 : 0;
  const le = buf.toString('ascii', o, o + 2) === 'II';
  const u16 = (p) => (le ? buf.readUInt16LE(p) : buf.readUInt16BE(p));
  const u32 = (p) => (le ? buf.readUInt32LE(p) : buf.readUInt32BE(p));
  const readIfd = (off) => {
    const tags = {};
    const n = u16(o + off);
    for (let i = 0; i < n; i++) {
      const e = o + off + 2 + i * 12;
      tags[u16(e)] = { type: u16(e + 2), count: u32(e + 4), value: u32(e + 8), entry: e };
    }
    return tags;
  };
  try {
    const ifd0 = readIfd(u32(o + 4));
    const ascii = (t) => (t ? buf.toString('ascii', o + t.value, o + t.value + t.count - 1) : null);
    // A film scanner stamps the scan date, not the day the photo was taken
    if (/SP-?3000|SP-?500|Frontier|Noritsu|scan/i.test(ascii(ifd0[0x0110]) || '')) return null;
    // only the capture time counts (0x0132 is just when the file was last saved)
    const raw = ifd0[0x8769] ? ascii(readIfd(ifd0[0x8769].value)[0x9003]) : null;
    const m = raw && raw.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}` : null;
  } catch {
    return null;
  }
}

const naturalKey = (s) => s.replace(/\d+/g, (d) => d.padStart(8, '0')).toLowerCase();
const slugify = (s) => s.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const IMAGE_RE = /\.(jpe?g|png|webp|tiff?)$/i;

async function listInputs(inputs) {
  const files = [];
  for (const input of inputs) {
    const stat = await fs.stat(input);
    if (stat.isDirectory()) {
      for (const f of await fs.readdir(input)) if (IMAGE_RE.test(f)) files.push(path.join(input, f));
    } else if (IMAGE_RE.test(input)) files.push(input);
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
    const thin = (px, dim) => px >= 0 && px <= dim * 0.04;
    const changed = t.info.width !== info.width || t.info.height !== info.height;
    if (changed && thin(left, info.width) && thin(right, info.width) && thin(top, info.height) && thin(bottom, info.height)) {
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
  if (!inputs.length) throw new Error('usage: node scripts/process-photos.mjs gallery <folder-or-photo> [...]');
  const files = await listInputs(inputs);
  if (!files.length) throw new Error(`no images found in ${inputs.join(', ')}`);
  await fs.mkdir(PHOTO_OUT, { recursive: true });

  let previous = {};
  try {
    for (const p of JSON.parse(await fs.readFile(MANIFEST, 'utf8')).photos || []) previous[p.id] = p;
  } catch { previous = {}; }

  const photos = [];
  for (const [i, file] of files.entries()) {
    const base = path.basename(file);
    const id = slugify(base);
    const meta = await sharp(file).metadata();
    const img = await decodeTrimmed(file);
    const { width: w0, height: h0 } = img;
    const out = {};
    for (const [key, edge] of Object.entries(SIZES)) {
      const name = `${id}-${key}.webp`;
      await sharp(img.data, img.raw)
        .resize({ width: w0 >= h0 ? edge : null, height: h0 > w0 ? edge : null, withoutEnlargement: true })
        .webp({ quality: key === 'lg' ? 80 : 74, effort: 5 })
        .toFile(path.join(PHOTO_OUT, name));
      out[key] = `/photos/${name}`;
    }
    const scale = Math.min(1, SIZES.lg / Math.max(w0, h0));
    const prev = previous[id] || {};
    photos.push({
      id,
      ...out,
      w: Math.round(w0 * scale),
      h: Math.round(h0 * scale),
      taken: exifDate(meta.exif),
      chapter: prev.chapter ?? null,
      alt: prev.alt ?? '',
      ...(prev.featured ? { featured: true } : {}),
      source: base,
    });
    process.stdout.write(`\r${i + 1}/${files.length} ${base}`.padEnd(70));
  }
  // One key for every photo: capture time where the camera recorded it, then
  // the photographer's file order (undated photos keep their file order, last)
  const sortKey = (p) => `${p.taken ?? '9999'}|${naturalKey(p.source)}`;
  photos.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const manifest = { _about: 'Generated by scripts/process-photos.mjs. Safe to edit chapter/alt/featured by hand; re-running keeps those edits.', photos };
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\n${photos.length} photos -> ${path.relative(ROOT, PHOTO_OUT)}, manifest -> ${path.relative(ROOT, MANIFEST)}`);
}

const [mode, ...args] = process.argv.slice(2);
if (mode === 'hero') await hero();
else if (mode === 'gallery') await gallery(args);
else {
  console.error('usage: node scripts/process-photos.mjs hero | gallery <folder-or-photo> [...]');
  process.exit(1);
}
