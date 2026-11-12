#!/usr/bin/env node
/**
 * Makes src/thank-you/data/people.json, the photos each household is in (the
 * gallery's Your Photos tab), from the couple's naming of face groups on the
 * private "Who's Who" page.
 *
 *   node scripts/people.mjs <faces.json> <tags.json> [--extra <extra.json>]
 *
 *   faces.json  the page's groups (its published faces.json):
 *               { "groups": { "g001": { "photos": ["photo-id", ...] }, ... } }
 *   tags.json   the names given, as saved by the page (its "tags" collection),
 *               either { "g001": { "kind": "guest", "name": ..., "letter": ... } }
 *               or a list of { "id": "g001", "data": { ... } }. Kinds:
 *               guest (a name), couple (Shriya or Neil: the "couple" letter),
 *               other (not a guest) and unsure; the last two are left out.
 *   extra.json  optional photos added by hand: { "<letter>": ["photo-id", ...] }
 *
 * A typed name that isn't on the guest list (no letter) is looked up by name
 * and alias in src/data/attendees.json. One that still matches no one is
 * reported and left out: add it there as an alias, or its photos to extra.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/thank-you/data/people.json');
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));

const args = process.argv.slice(2);
const extraAt = args.indexOf('--extra');
const extraFile = extraAt >= 0 ? args.splice(extraAt, 2)[1] : null;
if (args.length !== 2) {
  console.error('usage: node scripts/people.mjs <faces.json> <tags.json> [--extra <extra.json>]');
  process.exit(1);
}
const [facesFile, tagsFile] = args;

const groups = read(facesFile).groups || {};
const rawTags = read(tagsFile);
const tags = Array.isArray(rawTags) ? Object.fromEntries(rawTags.map((d) => [d.id, d.data])) : rawTags;
const photos = read(path.join(ROOT, 'src/thank-you/data/photos.json')).photos;
const order = new Map(photos.map((p, i) => [p.id, i]));
const people = read(path.join(ROOT, 'src/data/attendees.json')).people;
const letters = new Set(people.map((p) => p.letter));

const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const byName = new Map();
for (const p of people) for (const n of [p.name, ...(p.aliases || [])]) byName.set(fold(n), p.letter);

const households = new Map();
const add = (letter, ids) => {
  if (!households.has(letter)) households.set(letter, new Set());
  for (const id of ids) if (order.has(id)) households.get(letter).add(id);
};
const unmatched = [];
const unknownGroups = [];
let used = 0;
for (const [gid, tag] of Object.entries(tags)) {
  if (!tag || (tag.kind !== 'guest' && tag.kind !== 'couple')) continue;
  const group = groups[gid];
  if (!group) {
    unknownGroups.push(gid);
    continue;
  }
  const letter = tag.kind === 'couple' ? 'couple' : letters.has(tag.letter) ? tag.letter : byName.get(fold(tag.name || ''));
  if (!letter) {
    unmatched.push(`${tag.name} (${gid}, ${group.photos.length} photos)`);
    continue;
  }
  add(letter, group.photos);
  used++;
}
if (extraFile) {
  for (const [letter, ids] of Object.entries(read(extraFile))) {
    if (!letters.has(letter)) {
      console.error(`extra: "${letter}" isn't a letter key in src/data/attendees.json`);
      process.exit(1);
    }
    add(letter, ids);
  }
}

// one household per line, its photos in gallery order
const keys = [...households.keys()].filter((k) => households.get(k).size).sort();
const lines = keys.map((k) => `    ${JSON.stringify(k)}: ${JSON.stringify([...households.get(k)].sort((a, b) => order.get(a) - order.get(b)))}`);
const about = read(OUT)._about;
fs.writeFileSync(OUT, `{\n  "_about": ${JSON.stringify(about)},\n  "households": {${lines.length ? `\n${lines.join(',\n')}\n  ` : ''}}\n}\n`);

const sizes = keys.map((k) => households.get(k).size).sort((a, b) => a - b);
console.log(`people.json: ${keys.length} households from ${used} named groups` + (sizes.length ? `; photos each: ${sizes[0]}–${sizes[sizes.length - 1]}, median ${sizes[sizes.length >> 1]}` : ''));
if (unmatched.length) console.log(`Not on the guest list, left out (${unmatched.length}):\n  ${unmatched.join('\n  ')}`);
if (unknownGroups.length) console.log(`Named groups not in faces.json, left out: ${unknownGroups.join(', ')}`);
