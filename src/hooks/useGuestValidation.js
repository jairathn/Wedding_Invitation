import guestData from '../data/guests.json';

export function useGuestValidation() {
  const validateGuest = (name) => {
    if (!name || typeof name !== 'string') {
      return { valid: false, matchedName: null };
    }

    const normalizedInput = name.trim().toLowerCase();

    if (!normalizedInput) {
      return { valid: false, matchedName: null };
    }

    // Check for exact match (case-insensitive)
    const exactMatch = guestData.guests.find(
      guest => guest.toLowerCase() === normalizedInput
    );

    if (exactMatch) {
      return { valid: true, matchedName: exactMatch };
    }

    // Check for first name only match (if unique)
    const firstNameMatches = guestData.guests.filter(guest => {
      const firstName = guest.split(' ')[0].toLowerCase();
      return firstName === normalizedInput;
    });

    if (firstNameMatches.length === 1) {
      return { valid: true, matchedName: firstNameMatches[0] };
    }

    // Check for partial match (contains)
    const partialMatches = guestData.guests.filter(guest =>
      guest.toLowerCase().includes(normalizedInput) ||
      normalizedInput.includes(guest.toLowerCase())
    );

    if (partialMatches.length === 1) {
      return { valid: true, matchedName: partialMatches[0] };
    }

    return { valid: false, matchedName: null };
  };

  return { validateGuest };
}
