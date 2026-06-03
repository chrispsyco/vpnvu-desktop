/**
 * Reports how much of the globe viewport is occluded from the top and bottom
 * by UI overlays — the notification banner (top) and the connection panel
 * (bottom). Consumers (globe-focus.ts) read these values to bias the focus
 * target so the active server pin lands inside the visible band instead of
 * behind a card.
 *
 * Heights are stored as normalised fractions of the viewport height (0..1),
 * not pixel values, so the tilt math is resolution-independent.
 */

const STATE = {
  topObstacleNorm: 0,
  bottomObstacleNorm: 0,
  viewportHeight: 0,
};

export function setGlobeViewportHeight(h: number): void {
  STATE.viewportHeight = h;
}

export function reportGlobeObstacle(position: 'top' | 'bottom', heightPx: number): void {
  if (STATE.viewportHeight <= 0) return;
  const norm = Math.max(0, Math.min(1, heightPx / STATE.viewportHeight));
  if (position === 'top') {
    STATE.topObstacleNorm = norm;
  } else {
    STATE.bottomObstacleNorm = norm;
  }
}

export function clearGlobeObstacle(position: 'top' | 'bottom'): void {
  if (position === 'top') {
    STATE.topObstacleNorm = 0;
  } else {
    STATE.bottomObstacleNorm = 0;
  }
}

/**
 * Returns the desired vertical position of the focused pin within the globe
 * canvas, in globe-radius units (0 = equator on screen, +1 = top, -1 = bottom).
 *
 * With no obstacles the pin lands on the equator (centre of the canvas).
 * Obstacles push it toward the unobstructed half so it always sits in the
 * vertical centre of the visible band — e.g. expanding the connection panel
 * shifts the pin up; opening a notification banner shifts it down.
 *
 * The 0.5 conversion factor maps `obstacle fraction of viewport` to
 * `globe-radius units of camera Y-space`. Calibrated empirically from the
 * connected main view (see print 2026-06-03): the purely geometric value
 * (cameraZ=4.2, fov=38°, radius=1.59 → ≈0.91) overshot because the globe is
 * scaled up by the connected-state zoom (staticZoomBias 0.8 in GlobeScene),
 * which makes the globe larger on screen and so needs a smaller factor. At 0.5
 * the pin lands in the vertical centre of the visible band (between the header
 * and the connection panel). Was 1.19 → 0.91 → 0.5.
 */
export function computeFocusTargetY(baseTargetY = 0): number {
  const shift = (STATE.bottomObstacleNorm - STATE.topObstacleNorm) * 0.5;
  // Clamp keeps the pin inside the visible globe (|y| ≤ ~0.7 stays away from
  // poles where projection distortion hurts).
  return Math.max(-0.7, Math.min(0.7, baseTargetY + shift));
}
