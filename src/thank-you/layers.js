// Browser-history entries for the gallery and the photo viewer, so the back
// button (or Android's back gesture, or an iPhone edge swipe) closes whatever
// is on top instead of leaving the site. Every gallery opening gets its own
// token, so entries left over from before a reload never count as open.

export function newLayerToken() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Push an entry for a layer that just opened. */
export function pushLayer(ty, token) {
  try {
    window.history.pushState({ ...window.history.state, ty, token }, '');
  } catch {
    /* history unavailable (sandboxed frame): layers just close directly */
  }
}

export function layerState() {
  const s = window.history.state;
  return { ty: s?.ty ?? null, token: s?.token ?? null };
}

/**
 * Close a layer by going back through its history entry. Returns false when
 * that entry isn't the current one, and the caller should close it directly.
 */
export function popLayer(ty, token) {
  const s = layerState();
  if (s.ty !== ty || s.token !== token) return false;
  window.history.back();
  return true;
}
