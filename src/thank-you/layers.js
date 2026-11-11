// Browser-history entries for the gallery and the photo viewer, so the back
// button (or Android's back gesture, or an iPhone edge swipe) closes whatever
// is on top instead of leaving the site, and Forward opens it again.
//
// Each entry records what it stands for: { ty: 'gallery' | 'photo', token,
// depth, start?, index?, tab? }. depth counts our entries above the page's own
// (the gallery is 1, a photo opened from the grid is 2); tab is the gallery tab
// it belongs to. Every gallery opening gets its own token, so entries left from
// earlier openings are recognised as stale.

const DEFAULT_DEPTH = { gallery: 1, photo: 2 };

export function newLayerToken() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** The layer the current history entry stands for, or null on the page's own entry. */
export function currentLayer() {
  const s = window.history.state;
  if (!s?.ty || !s.token) return null;
  return {
    ty: s.ty,
    token: s.token,
    depth: s.depth ?? DEFAULT_DEPTH[s.ty] ?? 1,
    start: s.start ?? null,
    index: s.index ?? null,
    tab: s.tab ?? null,
  };
}

/** Add an entry for a layer that just opened. */
export function pushLayer(layer) {
  try {
    window.history.pushState({ ...window.history.state, ...layer }, '');
  } catch {
    /* history unavailable (sandboxed frame): layers just close directly */
  }
}

/** Update the current entry in place (e.g. which photo is showing). */
export function updateLayer(patch) {
  try {
    window.history.replaceState({ ...window.history.state, ...patch }, '');
  } catch {
    /* as above */
  }
}

// A step back is asynchronous: until its popstate arrives, a second close
// (a double-click, two quick Escapes) must not step back again.
let stepping = false;
let steppingTimer = 0;
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    stepping = false;
    window.clearTimeout(steppingTimer);
  });
}

/**
 * Go back through this gallery's entries down to `toDepth` (0 = the page).
 * Returns false when the current entry isn't one of them; the caller then
 * closes the layer directly.
 */
export function leaveLayers(token, toDepth = 0) {
  if (stepping) return true; // already on the way back; its popstate will close the layer
  const c = currentLayer();
  if (!c || c.token !== token || c.depth <= toDepth) return false;
  stepping = true;
  steppingTimer = window.setTimeout(() => {
    stepping = false;
  }, 1000);
  window.history.go(toDepth - c.depth);
  return true;
}

// After a reload (or a phone restoring a discarded tab) the browser can still
// be sitting on one of our entries while nothing is open: step back to the
// page's own entry once, so Back never needs presses that change nothing.
let checkedOnLoad = false;
export function leaveStaleLayers() {
  if (checkedOnLoad) return;
  checkedOnLoad = true;
  const c = currentLayer();
  if (c) window.history.go(-c.depth);
}
