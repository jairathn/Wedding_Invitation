import type { Session, Guest } from '../types';

const SESSION_KEY = 'wedding_app_session';

export function getStoredSession(): Session | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as Session;
  } catch {
    return null;
  }
}

export function storeSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function detectDeviceType(): 'kiosk_ipad' | 'mobile' {
  const ua = navigator.userAgent.toLowerCase();
  const isIPad = ua.includes('ipad') || (ua.includes('macintosh') && navigator.maxTouchPoints > 1);
  const screenWidth = window.screen.width;
  // iPad Pro 12.9" has a width of 1024 in portrait
  if (isIPad && screenWidth >= 1024) {
    return 'kiosk_ipad';
  }
  return 'mobile';
}

export async function registerGuest(firstName: string, lastName: string): Promise<Session> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      deviceType: detectDeviceType(),
      userAgent: navigator.userAgent,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to register. Please try again.');
  }

  const session: Session = await res.json();
  storeSession(session);
  return session;
}

export function getGuestDisplayName(guest: Guest): string {
  return `${guest.firstName} ${guest.lastName}`;
}
