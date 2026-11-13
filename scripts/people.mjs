#!/usr/bin/env node
/**
 * Makes src/thank-you/data/people.json from the couple's naming of face groups
 * on the private "Who's Who" page: the photos each household is in (the
 * gallery's Your Photos tab), and which guests are in at least one of them
 * themselves (only they get the tab; it still shows their household's photos).
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
 *   extra.json  optional photos added by hand, under a household's letter (they
 *               join its tab) or a guest's name exactly as in attendees.json
 *               (they join that household's tab, and the guest gets the tab):
 *               { "<letter or guest name>": ["photo-id", ...] }
 *
 * A guest is the one picked from the guest list, or else is found by name and
 * alias in src/data/attendees.json (a name typed in, or one corrected there
 * since). A pick whose name no longer matches anyone still counts for its
 * household but names no one. A typed name that matches no one is reported
 * and left out: add it to attendees.json as an alias, or its photos to
 * extra.json. Photos no longer in photos.json are dropped, and a guest is only
 * named for photos still there.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/thank-you/data/people.json');
const ABOUT =
  "Who is in which photo, for the gallery's Your Photos tab. households maps a letter key from src/data/attendees.json to the ids (in photos.json) of the photos anyone in that household is in; people lists the guests who are in at least one of them themselves. Only they get the tab, and it shows their household's photos. Made by scripts/people.mjs from the couple's naming of face groups; see README.md.";
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''));

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
const guestByName = new Map(people.map((p) => [p.name, p]));

const fold = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const byName = new Map(); // a name or alias, folded -> the guest
for (const p of people) for (const n of [p.name, ...(p.aliases || [])]) byName.set(fold(n), p);
const couple = people.filter((p) => p.letter === 'couple').map((p) => p.name);

const households = new Map();
// adds photos to a household; returns how many of them are in the gallery
const add = (letter, ids) => {
  if (!households.has(letter)) households.set(letter, new Set());
  let inGallery = 0;
  for (const id of ids) {
    if (!order.has(id)) continue;
    households.get(letter).add(id);
    inGallery++;
  }
  return inGallery;
};
const named = new Set(); // guests in at least one photo in the gallery
const name = (guest) => {
  if (guest.letter === 'couple') couple.forEach((n) => named.add(n)); // their own card is shared
  else named.add(guest.name);
};
const unmatched = [];
const unnamed = [];
const unknownGroups = [];
let used = 0;
for (const [gid, tag] of Object.entries(tags)) {
  if (!tag || (tag.kind !== 'guest' && tag.kind !== 'couple')) continue;
  const group = groups[gid];
  if (!group) {
    unknownGroups.push(gid);
    continue;
  }
  if (tag.kind === 'couple') {
    // "Shriya or Neil": one of the two
    if (add('couple', group.photos)) couple.forEach((n) => named.add(n));
    used++;
    continue;
  }
  const picked = guestByName.get(tag.name);
  const who = picked && picked.letter === tag.letter ? picked : byName.get(fold(tag.name || ''));
  const letter = who?.letter ?? (letters.has(tag.letter) ? tag.letter : null);
  if (!letter) {
    unmatched.push(`${tag.name} (${gid}, ${group.photos.length} photos)`);
    continue;
  }
  const seen = add(letter, group.photos);
  if (!who) unnamed.push(`${tag.name} (${gid}, household ${letter})`);
  else if (seen) name(who);
  used++;
}
if (extraFile) {
  for (const [key, ids] of Object.entries(read(extraFile))) {
    const guest = guestByName.get(key);
    const letter = guest ? guest.letter : letters.has(key) ? key : null;
    if (!letter || !Array.isArray(ids)) {
      console.error(`extra: "${key}" should be a household letter or a guest's name from src/data/attendees.json, with a list of photo ids`);
      process.exit(1);
    }
    if (add(letter, ids) && guest) name(guest);
  }
}

// one household per line, its photos in gallery order
const keys = [...households.keys()].filter((k) => households.get(k).size).sort();
const lines = keys.map((k) => `    ${JSON.stringify(k)}: ${JSON.stringify([...households.get(k)].sort((a, b) => order.get(a) - order.get(b)))}`);
let about = ABOUT;
try {
  about = read(OUT)._about || ABOUT;
} catch {
  // no file yet, or a broken one: it is written afresh
}
const names = [...named].filter((n) => households.get(guestByName.get(n).letter)?.size).sort((a, b) => a.localeCompare(b));
fs.writeFileSync(
  OUT,
  `{\n  "_about": ${JSON.stringify(about)},\n  "people": [${names.length ? `\n${names.map((n) => `    ${JSON.stringify(n)}`).join(',\n')}\n  ` : ''}],\n` +
    `  "households": {${lines.length ? `\n${lines.join(',\n')}\n  ` : ''}}\n}\n`,
);

const sizes = keys.map((k) => households.get(k).size).sort((a, b) => a - b);
console.log(`people.json: ${keys.length} households from ${used} named groups` + (sizes.length ? `; photos each: ${sizes[0]}–${sizes[sizes.length - 1]}, median ${sizes[sizes.length >> 1]}` : ''));
const withPhotos = new Set(keys);
const left = people.filter((p) => withPhotos.has(p.letter) && !named.has(p.name)).map((p) => p.name);
console.log(`${names.length} guests are in a photo themselves and get the tab; ${left.length} more in those households are in none, so they don't`);
const unseen = keys.filter((k) => !people.some((p) => p.letter === k && named.has(p.name)));
if (unseen.length) console.log(`Households with photos but no one in them named, so no one sees them: ${unseen.join(', ')}`);
if (unmatched.length) console.log(`Not on the guest list, left out (${unmatched.length}):\n  ${unmatched.join('\n  ')}`);
if (unnamed.length) console.log(`Picked names no longer on the guest list (photos kept for the household; no one named):\n  ${unnamed.join('\n  ')}`);
if (unknownGroups.length) console.log(`Named groups not in faces.json, left out: ${unknownGroups.join(', ')}`);
