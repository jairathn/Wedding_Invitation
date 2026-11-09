// Guest lookup shared by the thank-you card (/) and the invitation (/invitation).
// Only people who attended are listed (src/data/attendees.json).
import attendees from '../data/attendees.json';

const TITLES = /^(dr|mr|mrs|ms|miss|mx)\.?\s+/i;
// trailing letters after a name ("MD", "M.D.", "Jr", "PhD", "III")
const SUFFIXES = /\s+(m d|md|ph d|phd|jr|sr|ii|iii|iv|dds|esq)$/;

export function normalizeName(input) {
  let n = String(input || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[’'`]/g, '')
    .replace(/[.,\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(TITLES, '')
    .toLowerCase();
  while (SUFFIXES.test(n)) n = n.replace(SUFFIXES, '');
  return n;
}

// normalized name -> { person, display } for every real name and alias
const index = new Map();
for (const person of attendees.people) {
  for (const display of [person.name, ...(person.aliases || [])]) {
    index.set(normalizeName(display), { person, display });
  }
}

// Edit distance where swapping two neighbouring letters ("Niel") counts as one slip
function distance(a, b) {
  if (a === b) return 0;
  let prev2 = null;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
    }
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

// "Neil Kumar Jairath" -> "neil jairath", "Jayswal Shriya" -> "shriya jayswal"
function variants(n) {
  const t = n.split(' ');
  const out = [];
  if (t.length === 2) out.push(`${t[1]} ${t[0]}`);
  if (t.length >= 3) out.push(`${t[0]} ${t[t.length - 1]}`, `${t[0]} ${t.slice(1).join('')}`);
  return out;
}

// Family terms people naturally add ("Pinky Auntie", "Ashok Uncle")
const KIN = /\b(auntie|aunty|aunt|uncle|ji|didi|bhabhi|bhaiya|bhai|mama|mami|masi|mausi|chacha|chachi|bua|nani|nana|dadi|dada|kaka|kaki)\b/g;

// Exact name or alias, also in swapped order or with a middle name
function lookup(n) {
  const hit = index.get(n);
  if (hit) return { key: n, ...hit };
  for (const v of variants(n)) {
    const h = index.get(v);
    if (h) return { key: v, ...h };
  }
  return null;
}

const MAX_SUGGESTIONS = 3;

/**
 * Match what a guest typed against the attendee list.
 * @returns {{status:'exact', person:object, displayName:string}
 *          |{status:'fuzzy', suggestions:string[]}
 *          |{status:'need-last'}|{status:'none'}|{status:'empty'}}
 */
export function matchGuest(input) {
  const full = normalizeName(input);
  if (!full) return { status: 'empty' };
  const n = full.replace(KIN, ' ').replace(/\s+/g, ' ').trim() || full;

  const hit = lookup(n);
  if (hit) {
    // A nickname or maiden name one slip from someone else's own name
    // ("Shriya Jairath" / "Shriyam Jairath"): ask rather than guess.
    if (hit.display !== hit.person.name) {
      const near = attendees.people.filter((p) => p !== hit.person && distance(hit.key, normalizeName(p.name)) <= 1);
      if (near.length) return { status: 'fuzzy', suggestions: [hit.display, ...near.map((p) => p.name)].slice(0, MAX_SUGGESTIONS) };
    }
    return { status: 'exact', person: hit.person, displayName: hit.display };
  }

  // A single name ("Pinky", "Hanona"): offer the few guests it fits. A common
  // surname that fits more than three asks for the full name instead.
  const tokens = n.split(' ');
  if (tokens.length === 1) {
    const hits = new Map();
    for (const [key, entry] of index) {
      const parts = key.split(' ');
      if (parts[0] !== tokens[0] && parts[parts.length - 1] !== tokens[0]) continue;
      // show the guest's own name unless only a nickname matched
      if (!hits.has(entry.person.name) || entry.display === entry.person.name) hits.set(entry.person.name, entry.display);
    }
    if (hits.size > MAX_SUGGESTIONS) return { status: 'need-last' };
    if (hits.size) return { status: 'fuzzy', suggestions: [...hits.values()] };
  }

  const scored = [];
  for (const [key, entry] of index) {
    const d = distance(n, key);
    if (d <= 2) scored.push({ d, entry });
  }
  scored.sort((a, b) => a.d - b.d || (a.entry.display === a.entry.person.name ? -1 : 1));
  const seen = new Set();
  const suggestions = [];
  for (const { entry } of scored) {
    if (seen.has(entry.person.name)) continue;
    seen.add(entry.person.name);
    suggestions.push(entry.display);
    if (suggestions.length === MAX_SUGGESTIONS) break;
  }
  return suggestions.length ? { status: 'fuzzy', suggestions } : { status: 'none' };
}

/** Open for a name the guest picked from our suggestions (no further questions). */
export function resolveGuest(name) {
  const hit = lookup(normalizeName(name));
  return hit ? { status: 'exact', person: hit.person, displayName: hit.display } : { status: 'none' };
}

/** The first name to greet this guest by: the couple's name for them when they use one. */
export const greetingName = (person, displayName) => person?.greet || firstName(displayName);

/** The attendee record for an exact name or alias (no fuzzy matching). */
export function findPerson(name) {
  return index.get(normalizeName(name))?.person ?? null;
}

/** Key for this guest's original invitation message in personalizedMessages.json. */
export function inviteMessageKey(name) {
  const person = findPerson(name);
  return person ? person.inviteKey || person.name : name;
}

export const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || '';

// Remember the guest on this device (60 days) so a return visit, or a trip to
// /invitation and back, opens straight to their card. Falls back to the tab's
// session when local storage is unavailable.
const SESSION_KEY = 'sn:guest';
const KEEP_MS = 60 * 24 * 60 * 60 * 1000;
export function rememberGuest(name) {
  const value = JSON.stringify({ name, t: Date.now() });
  try {
    localStorage.setItem(SESSION_KEY, value);
  } catch {
    try {
      sessionStorage.setItem(SESSION_KEY, value);
    } catch {
      /* storage unavailable (private mode): remembering is just a convenience */
    }
  }
}
export function recallGuest() {
  for (const store of ['localStorage', 'sessionStorage']) {
    try {
      const raw = window[store].getItem(SESSION_KEY);
      if (!raw) continue;
      const { name, t } = JSON.parse(raw);
      if (typeof name === 'string' && Date.now() - t < KEEP_MS) return name;
    } catch {
      /* unreadable or legacy value */
    }
  }
  return '';
}
