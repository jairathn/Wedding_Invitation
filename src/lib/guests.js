// Guest lookup shared by the thank-you card (/) and the invitation (/invitation).
// Only people who attended are listed (src/data/attendees.json).
import attendees from '../data/attendees.json';

const TITLES = /^(dr|mr|mrs|ms|miss|mx)\.?\s+/i;

export function normalizeName(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[’'`]/g, '')
    .replace(/[.,\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(TITLES, '')
    .toLowerCase();
}

// normalized name -> { person, display } for every real name and alias
const index = new Map();
for (const person of attendees.people) {
  for (const display of [person.name, ...(person.aliases || [])]) {
    index.set(normalizeName(display), { person, display });
  }
}

function levenshtein(a, b) {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
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

/**
 * Match what a guest typed against the attendee list.
 * @returns {{status:'exact', person:object, displayName:string}
 *          |{status:'fuzzy', suggestions:string[]}
 *          |{status:'none'}|{status:'empty'}}
 */
export function matchGuest(input) {
  const n = normalizeName(input);
  if (!n) return { status: 'empty' };

  let hit = index.get(n);
  if (!hit) {
    for (const v of variants(n)) {
      if ((hit = index.get(v))) break;
    }
  }
  if (hit) return { status: 'exact', person: hit.person, displayName: hit.display };

  const scored = [];
  for (const [key, entry] of index) {
    const d = levenshtein(n, key);
    if (d <= 2) scored.push({ d, entry });
  }
  scored.sort((a, b) => a.d - b.d);
  const seen = new Set();
  const suggestions = [];
  for (const { entry } of scored) {
    if (seen.has(entry.person.name)) continue;
    seen.add(entry.person.name);
    suggestions.push(entry.display);
    if (suggestions.length === 4) break;
  }
  return suggestions.length ? { status: 'fuzzy', suggestions } : { status: 'none' };
}

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

// Remember the guest across / and /invitation for this browser tab only.
const SESSION_KEY = 'sn:guest';
export function rememberGuest(name) {
  try {
    sessionStorage.setItem(SESSION_KEY, name);
  } catch {
    /* storage unavailable (private mode) — prefill is just a convenience */
  }
}
export function recallGuest() {
  try {
    return sessionStorage.getItem(SESSION_KEY) || '';
  } catch {
    return '';
  }
}
