#!/usr/bin/env node
/**
 * Checks the gallery's photo list before a build, so a slip while editing
 * src/thank-you/data/photos.json by hand stops the build (and the site keeps
 * its last good version) instead of breaking the gallery for every guest.
 *
 *   node scripts/check-photos.mjs      (runs as part of `npm run build`)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'src/thank-you/data/photos.json');
const PHOTOS = path.join(ROOT, 'public/photos');
const where = path.relative(ROOT, MANIFEST);

const problems = [];
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8').replace(/^﻿/, ''));
} catch (err) {
  console.error(`\n${where} can't be read: ${err.message}\n(Look for a missing or extra comma or bracket near that spot.)\n`);
  process.exit(1);
}

const photos = Array.isArray(manifest?.photos) ? manifest.photos : null;
if (!photos) problems.push('it has no "photos" list');
else if (!photos.length) problems.push('its "photos" list is empty');
if (manifest?.excluded !== undefined && !Array.isArray(manifest.excluded)) problems.push('"excluded" should be a list of file names');

const seen = new Set();
for (const [n, p] of (photos || []).entries()) {
  const at = `photo ${n + 1}${p && typeof p.id === 'string' ? ` (${p.id})` : ''}`;
  if (!p || typeof p !== 'object') {
    problems.push(`${at} isn't an object`);
    continue;
  }
  if (typeof p.id !== 'string' || !/^[a-z0-9-]+$/.test(p.id)) problems.push(`${at}: "id" should be lower-case letters, digits and dashes`);
  else if (seen.has(p.id)) problems.push(`${at}: the id appears twice`);
  else seen.add(p.id);
  if (!(Number.isFinite(p.w) && p.w > 0 && Number.isFinite(p.h) && p.h > 0)) problems.push(`${at}: "w" and "h" should be positive numbers`);
  if (p.chapter !== undefined && p.chapter !== null && typeof p.chapter !== 'string') problems.push(`${at}: "chapter" should be text`);
  if (p.featured !== undefined && typeof p.featured !== 'boolean') problems.push(`${at}: "featured" should be true or false`);
  if (p.seq !== undefined && !Number.isFinite(p.seq)) problems.push(`${at}: "seq" should be a number`);
  if (p.set !== undefined && (typeof p.set !== 'string' || !/^[a-z0-9]+$/.test(p.set))) problems.push(`${at}: "set" should be a short lower-case name`);
  if (p.alt !== undefined && typeof p.alt !== 'string') problems.push(`${at}: "alt" should be text`);
  if (typeof p.id === 'string') {
    const missing = ['sm', 'md', 'lg'].filter((size) => !fs.existsSync(path.join(PHOTOS, `${p.id}-${size}.webp`)));
    if (missing.length) problems.push(`${at}: public/photos/${p.id}-{${missing.join(',')}}.webp missing`);
  }
}

if (problems.length) {
  console.error(`\n${where} has ${problems.length} problem${problems.length > 1 ? 's' : ''}:`);
  for (const line of problems.slice(0, 30)) console.error(`  - ${line}`);
  if (problems.length > 30) console.error(`  ... and ${problems.length - 30} more`);
  console.error('');
  process.exit(1);
}
const featured = photos.filter((p) => p.featured).length;
console.log(`photos.json: ${photos.length} photos, ${featured} featured — ok`);
