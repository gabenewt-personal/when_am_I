/**
 * Mobile viewport helpers. On phones the on-screen keyboard shrinks the *visual*
 * viewport but not the layout viewport, so `innerHeight` and `vh` lie while it is
 * open. Everything here measures against `visualViewport` when available.
 */

export interface View {
  top: number; // offset of the visible area within the layout viewport
  height: number;
}

export function visibleArea(): View {
  const vv = typeof window !== "undefined" ? window.visualViewport : null;
  return vv ? { top: vv.offsetTop, height: vv.height } : { top: 0, height: window.innerHeight };
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCoarsePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

/**
 * How far to scroll so that a block from `top` to `bottom` (client coordinates)
 * is visible. If it all fits, the bottom is aligned (keeping what's above in view);
 * if it doesn't, the top wins. Returns 0 when already visible.
 */
export function scrollDeltaToShow(top: number, bottom: number, view: View, margin = 12): number {
  const viewTop = view.top + margin;
  const viewBottom = view.top + view.height - margin;
  if (top >= viewTop && bottom <= viewBottom) return 0;
  if (bottom - top <= viewBottom - viewTop) {
    return top < viewTop ? top - viewTop : bottom - viewBottom;
  }
  return top - viewTop;
}

export function scrollByDelta(delta: number) {
  if (Math.abs(delta) < 2) return;
  window.scrollBy({ top: delta, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}
