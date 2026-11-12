#!/usr/bin/env node
/**
 * Checks the gallery's photo list before a build, so a slip while editing
 * src/thank-you/data/photos.json by hand stops the build (and the site keeps
 * its last good version) instead of breaking the gallery for every guest.
 * Also checks src/thank-you/data/people.json (who is in which photo, for the
 * Your Photos tab) against the photo list and the guest list.
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

// people.json: which photos each household is in (the gallery's Your Photos tab)
const PEOPLE = path.join(ROOT, 'src/thank-you/data/people.json');
const ATTENDEES = path.join(ROOT, 'src/data/attendees.json');
const peopleWhere = path.relative(ROOT, PEOPLE);
const peopleProblems = [];
let households = {};
try {
  const people = JSON.parse(fs.readFileSync(PEOPLE, 'utf8').replace(/^\uFEFF/, ''));
  if (!people || typeof people.households !== 'object' || people.households === null || Array.isArray(people.households)) {
    peopleProblems.push('it should have a "households" object (it can be empty: {})');
  } else households = people.households;
} catch (err) {
  peopleProblems.push(`it can't be read: ${err.message}`);
}
const letters = new Set(JSON.parse(fs.readFileSync(ATTENDEES, 'utf8')).people.map((p) => p.letter));
for (const [letter, ids] of Object.entries(households)) {
  if (!letters.has(letter)) peopleProblems.push(`"${letter}" isn't a letter key in src/data/attendees.json`);
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
    peopleProblems.push(`"${letter}" should be a list of photo ids`);
    continue;
  }
  const unknown = ids.filter((id) => !seen.has(id));
  if (unknown.length) peopleProblems.push(`"${letter}" lists photos that aren't in photos.json: ${unknown.slice(0, 5).join(', ')}${unknown.length > 5 ? ', ...' : ''}`);
  if (new Set(ids).size !== ids.length) peopleProblems.push(`"${letter}" lists a photo twice`);
}

for (const [file, list] of [[where, problems], [peopleWhere, peopleProblems]]) {
  if (!list.length) continue;
  console.error(`\n${file} has ${list.length} problem${list.length > 1 ? 's' : ''}:`);
  for (const line of list.slice(0, 30)) console.error(`  - ${line}`);
  if (list.length > 30) console.error(`  ... and ${list.length - 30} more`);
}
if (problems.length || peopleProblems.length) {
  console.error('');
  process.exit(1);
}
const featured = photos.filter((p) => p.featured).length;
console.log(`photos.json: ${photos.length} photos, ${featured} featured — ok`);
const tagged = Object.values(households);
console.log(`people.json: ${tagged.length} households, ${new Set(tagged.flat()).size} photos with a guest named — ok`);
