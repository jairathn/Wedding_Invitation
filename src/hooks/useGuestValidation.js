import guestData from '../data/guests.json';

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,     // deletion
        matrix[j][i - 1] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }

  return matrix[len2][len1];
}

export function useGuestValidation() {
  const validateGuest = (name) => {
    if (!name || typeof name !== 'string') {
      return { status: 'nomatch', matchedName: null, suggestedName: null };
    }

    const normalizedInput = name.trim().toLowerCase();

    if (!normalizedInput) {
      return { status: 'nomatch', matchedName: null, suggestedName: null };
    }

    // Check for exact match (case-insensitive)
    const exactMatch = guestData.guests.find(
      guest => guest.toLowerCase() === normalizedInput
    );

    if (exactMatch) {
      return { status: 'exact', matchedName: exactMatch, suggestedName: null };
    }

    // Check for fuzzy match (1-2 character difference using Levenshtein distance)
    let closestMatch = null;
    let smallestDistance = Infinity;

    for (const guest of guestData.guests) {
      const distance = levenshteinDistance(normalizedInput, guest.toLowerCase());

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestMatch = guest;
      }
    }

    // Fuzzy match: 1-2 character difference
    if (smallestDistance >= 1 && smallestDistance <= 2) {
      return { status: 'fuzzy', matchedName: null, suggestedName: closestMatch };
    }

    // No match: more than 2 character difference
    return { status: 'nomatch', matchedName: null, suggestedName: null };
  };

  return { validateGuest };
}
