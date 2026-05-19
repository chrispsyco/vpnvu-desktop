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
 * The 1.19 conversion factor maps `obstacle fraction of viewport` to
 * `globe-radius units of camera Y-space`. It derives from the camera setup
 * for the pinned tray window (cameraZ=5.5, fov=38°, globe radius=1.59):
 *
 *   canvas half-height in world units = cameraZ * tan(fov/2) = 1.89
 *   1 viewport fraction = 1.89 world units = 1.89 / 1.59 = 1.19 globe radii
 *
 * The unpinned/wide aspect uses cameraZ=5, fov=40° → factor ≈ 1.14, so the
 * pin can drift ~5% off-centre at landscape ratios. Acceptable for now since
 * the unpinned layout isn't the primary target; revisit if it becomes one.
 */
export function computeFocusTargetY(baseTargetY = 0): number {
  const shift = (STATE.bottomObstacleNorm - STATE.topObstacleNorm) * 1.19;
  // Clamp keeps the pin inside the visible globe (|y| ≤ ~0.7 stays away from
  // poles where projection distortion hurts).
  return Math.max(-0.7, Math.min(0.7, baseTargetY + shift));
}
