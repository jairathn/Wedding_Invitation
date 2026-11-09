/** Fire a firework burst on the sky canvas at viewport coordinates (px). */
export function skyBurst(x, y, options = {}) {
  window.dispatchEvent(new CustomEvent('sky:burst', { detail: { x, y, ...options } }));
}
