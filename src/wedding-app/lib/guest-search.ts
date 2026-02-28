// Guest list fuzzy search for autocomplete
// Reads from the existing guest list JSON

import guestData from '../../data/guests.json';

export interface GuestSuggestion {
  fullName: string;
  firstName: string;
  lastName: string;
}

// Parse the guest list into structured data
const guestList: GuestSuggestion[] = guestData.guests.map((name: string) => {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { fullName: name, firstName, lastName };
});

export function getAllGuests(): GuestSuggestion[] {
  return guestList;
}

// Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Search guests with fuzzy matching
export function searchGuests(query: string): GuestSuggestion[] {
  if (!query || query.trim().length < 1) return [];

  const q = query.toLowerCase().trim();

  // First: exact prefix matches (highest priority)
  const prefixMatches = guestList.filter(g =>
    g.fullName.toLowerCase().startsWith(q) ||
    g.firstName.toLowerCase().startsWith(q) ||
    g.lastName.toLowerCase().startsWith(q)
  );

  // Second: contains matches
  const containsMatches = guestList.filter(g =>
    !prefixMatches.includes(g) &&
    g.fullName.toLowerCase().includes(q)
  );

  // Third: fuzzy matches (Levenshtein distance <= 2)
  const fuzzyMatches = guestList.filter(g => {
    if (prefixMatches.includes(g) || containsMatches.includes(g)) return false;
    const firstDist = levenshtein(q, g.firstName.toLowerCase());
    const lastDist = levenshtein(q, g.lastName.toLowerCase());
    return firstDist <= 2 || lastDist <= 2;
  });

  return [...prefixMatches, ...containsMatches, ...fuzzyMatches].slice(0, 8);
}

// Check if a name is on the guest list
export function isOnGuestList(firstName: string, lastName: string): boolean {
  const fn = firstName.toLowerCase().trim();
  const ln = lastName.toLowerCase().trim();
  return guestList.some(
    g => g.firstName.toLowerCase() === fn && g.lastName.toLowerCase() === ln
  );
}
