// Browser-history entries for the gallery and the photo viewer, so the back
// button (or Android's back gesture, or an iPhone edge swipe) closes whatever
// is on top instead of leaving the site, and Forward opens it again.
//
// Each entry records what it stands for: { ty: 'gallery' | 'photo', token,
// depth, start?, index?, photo?, tab? }. depth counts our entries above the
// page's own (the gallery is 1, a photo opened from the grid is 2); tab is the
// gallery tab it belongs to and photo the photo's id. Every gallery opening
// gets its own token, so entries left from earlier openings are recognised as
// stale.

const DEFAULT_DEPTH = { gallery: 1, photo: 2 };
const OURS = ['ty', 'token', 'depth', 'start', 'index', 'photo', 'tab'];

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
    photo: s.photo ?? null,
    tab: s.tab ?? null,
  };
}

// The router's own part of the current entry, without anything an earlier
// layer left in it
function routerState() {
  const s = window.history.state;
  if (!s || typeof s !== 'object') return s ?? null;
  const rest = { ...s };
  for (const k of OURS) delete rest[k];
  return rest;
}

/** Add an entry for a layer that just opened. Returns false if history can't be used. */
export function pushLayer(layer) {
  try {
    window.history.pushState({ ...routerState(), ...layer }, '');
    return true;
  } catch {
    return false; // history unavailable (sandboxed frame): layers just close directly
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
function stepBack(n) {
  stepping = true;
  window.clearTimeout(steppingTimer);
  steppingTimer = window.setTimeout(() => {
    stepping = false;
  }, 1000);
  window.history.go(-n);
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
  stepBack(c.depth - toDepth);
  return true;
}

/**
 * The page is showing but the browser sits on one of our entries with nothing
 * open (after a reload, a phone restoring a discarded tab, Forward while the
 * envelope is showing, or a jump through the history list): step back to the
 * page's own entry, so Back never needs presses that change nothing. Returns
 * true if it stepped.
 */
export function leaveStaleLayers() {
  const c = currentLayer();
  if (!c || stepping) return false;
  stepBack(c.depth);
  return true;
}
