import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

// Goes up each time the browser comes back online
let online = 0;
const listeners = new Set();
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    online += 1;
    listeners.forEach((f) => f());
  });
}
const subscribe = (f) => {
  listeners.add(f);
  return () => listeners.delete(f);
};
export const useOnline = () => useSyncExternalStore(subscribe, () => online, () => 0);

/**
 * For an image that may fail to load (a dropped connection): after a failure
 * it is held back, then tried again a few seconds later (up to three times),
 * and again whenever the connection comes back. Render the image only while
 * `failed` is false, with `key` (a new element is a new request).
 */
export function useImageRetry() {
  const now = useOnline();
  const [fail, setFail] = useState(null); // { n, at: online count, retry }
  useEffect(() => {
    if (!fail || fail.retry || fail.n > 3) return undefined;
    const t = window.setTimeout(() => setFail((f) => (f ? { ...f, retry: true } : f)), 2500 * fail.n);
    return () => window.clearTimeout(t);
  }, [fail]);
  const onError = useCallback(() => setFail((f) => ({ n: (f?.n ?? 0) + 1, at: now, retry: false })), [now]);
  const retry = useCallback(() => setFail((f) => (f ? { ...f, retry: true } : f)), []);
  const failed = !!fail && !fail.retry && fail.at === now;
  return { failed, key: fail ? `${fail.n}-${now}` : 'first', onError, retry };
}
