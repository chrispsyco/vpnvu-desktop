/**
 * Globe focus timeline — orchestrates the "fly to a server" animation.
 *
 * Three-phase choreography:
 *   1. Zoom out — camera pulls back so the user sees more of the globe.
 *   2. Pan      — rotation interpolates from current state to target lat/lng
 *                 along the shortest great-circle path.
 *   3. Zoom in  — camera returns once the target sits on the meridian.
 *
 * The driver is intentionally lock-free / non-React: GlobeRotator advances
 * the timeline once per frame via tickFocus(delta), and any other consumer
 * (camera zoom controller) reads the last frame with peekFocus().
 */

import { getGlobeRotationX, getGlobeRotationY } from './globe-rotation';
import { computeFocusTargetY } from './globe-viewport';

export interface GlobeFocus {
  lat: number;
  lng: number;
}

export interface GlobeFocusFrame {
  /** True while a transition is in flight (advancing toward target). */
  active: boolean;
  /**
   * True once a target is set — stays true after `active` flips to false so
   * the globe parks on the destination instead of resuming idle drift.
   */
  locked: boolean;
  /** Linear 0..1 progress through the full timeline. */
  progress: number;
  /** Eased rotation Y to apply this frame. */
  y: number;
  /** Eased rotation X to apply this frame. */
  x: number;
  /** Camera zoom multiplier (1 = nominal, > 1 = pulled back). */
  zoom: number;
}

interface Timeline {
  startY: number;
  startX: number;
  targetY: number;
  targetX: number;
  elapsed: number;
  duration: number;
}

/** Total length of the focus animation in seconds. */
const FOCUS_DURATION = 1.8;
/** Peak camera zoom-out multiplier (mid-pan). 1.35 = 35% farther back. */
const ZOOM_OUT_PEAK = 1.35;
/**
 * Where the focused city should land vertically on the globe, in units of the
 * globe radius (0 = equator on screen, 1 = top of the globe). Translates into
 * an extra tilt of `asin(targetY)` radians, regardless of the city's latitude —
 * so São Paulo and Stockholm both park at the same screen height.
 *
 * Slightly negative so the pin sits ~30px below the vertical centre of the
 * visible band, giving the upper hemisphere a touch more breathing room above
 * the active country. `computeFocusTargetY()` adds an obstacle-driven shift
 * on top so the relative offset stays constant when the notification banner
 * or expanded connection panel cover part of the globe.
 */
const FOCUS_TARGET_Y_BASE = -0.05;

/** Per-second rate at which parking tilt eases toward the dynamic target. */
const PARKING_TILT_RATE = 3.5;
/** Stop lerping once we're within this many radians of the target. */
const PARKING_TILT_EPSILON = 0.0005;

function desiredTargetX(latDeg: number): number {
  const targetY = computeFocusTargetY(FOCUS_TARGET_Y_BASE);
  return (latDeg * Math.PI) / 180 - Math.asin(targetY);
}

const STATE: {
  target: GlobeFocus | null;
  timeline: Timeline | null;
  lastFrame: GlobeFocusFrame;
} = {
  target: null,
  timeline: null,
  lastFrame: { active: false, locked: false, progress: 1, y: 0, x: 0, zoom: 1 },
};

function yForLng(lngDeg: number): number {
  // visibleLngFromY(y) = lngDeg  ⇒  y = (270 - lngDeg) * π / 180
  return ((270 - lngDeg) * Math.PI) / 180;
}

function wrapAngle(diff: number): number {
  const TWO_PI = Math.PI * 2;
  let d = diff % TWO_PI;
  if (d > Math.PI) d -= TWO_PI;
  if (d <= -Math.PI) d += TWO_PI;
  return d;
}

function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

/**
 * Bell-shaped zoom curve. 0 at start/end, 1 at midpoint.
 * Asymmetric: hits peak slightly past midpoint so the pull-back feels
 * decisive on the way out and the zoom-in lands together with the pan.
 */
function zoomBell(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  // Skewed bell — peak at t=0.45, smooth sine ramp on each side
  if (x < 0.45) {
    return Math.sin((x / 0.45) * (Math.PI / 2));
  }
  return Math.sin(((1 - x) / 0.55) * (Math.PI / 2));
}

/**
 * Begin a focus transition to (lat, lng). Captures the current rotation as
 * the starting point so the animation continues smoothly from wherever the
 * globe is right now — including mid-transition re-targeting.
 *
 * No-op when the requested coordinate already matches the parked target
 * (within 0.01°) and no timeline is in flight. Without this guard, returning
 * to the main view from Account/Settings would re-run the full zoom-out → pan
 * → zoom-in even though the destination didn't change.
 */
export function requestFocus(target: GlobeFocus): void {
  if (
    STATE.target &&
    STATE.timeline === null &&
    Math.abs(STATE.target.lat - target.lat) < 0.01 &&
    Math.abs(STATE.target.lng - target.lng) < 0.01
  ) {
    return;
  }
  const currentY = getGlobeRotationY();
  const currentX = getGlobeRotationX();
  const desiredY = yForLng(target.lng);
  // Resolve shortest angular path (avoid spinning the long way around)
  const delta = wrapAngle(desiredY - currentY);
  // Tilt so the target point ends up at the dynamic view-y on the globe's
  // surface. After rotating the (lat, 0) point by -X around X, its world-Y is
  // sin(lat - X), so we want X = lat - asin(targetY).
  const targetX = desiredTargetX(target.lat);
  STATE.target = target;
  STATE.timeline = {
    startY: currentY,
    startX: currentX,
    targetY: currentY + delta,
    targetX,
    elapsed: 0,
    duration: FOCUS_DURATION,
  };
}

/** Release the focus lock — globe returns to its idle drift. */
export function clearFocus(): void {
  STATE.target = null;
  STATE.timeline = null;
  STATE.lastFrame = { active: false, locked: false, progress: 1, y: 0, x: 0, zoom: 1 };
}

/**
 * Advance the timeline by `dt` seconds and return the current frame.
 * Must be called exactly once per render frame (by GlobeRotator).
 */
export function tickFocus(dt: number): GlobeFocusFrame {
  const tl = STATE.timeline;
  const locked = STATE.target !== null;

  if (!tl) {
    // No timeline in flight. If a target is still locked, hold the previous
    // rotation/zoom so the globe parks on the destination — but ease the X
    // tilt toward the *current* dynamic target so the pin stays inside the
    // visible band when the connection panel expands or a notification
    // banner appears/disappears.
    if (locked && STATE.target) {
      const desiredX = desiredTargetX(STATE.target.lat);
      const currentX = STATE.lastFrame.x;
      const deltaX = desiredX - currentX;
      let nextX = currentX;
      if (Math.abs(deltaX) > PARKING_TILT_EPSILON) {
        const stepFactor = 1 - Math.exp(-PARKING_TILT_RATE * dt);
        nextX = currentX + deltaX * stepFactor;
      } else if (currentX !== desiredX) {
        nextX = desiredX;
      }
      STATE.lastFrame = {
        ...STATE.lastFrame,
        active: false,
        locked: true,
        zoom: 1,
        x: nextX,
      };
    } else if (locked) {
      STATE.lastFrame = { ...STATE.lastFrame, active: false, locked: true, zoom: 1 };
    } else {
      STATE.lastFrame = { active: false, locked: false, progress: 1, y: 0, x: 0, zoom: 1 };
    }
    return STATE.lastFrame;
  }

  tl.elapsed = Math.min(tl.duration, tl.elapsed + dt);
  const t = tl.elapsed / tl.duration;
  const eased = easeInOutQuart(t);
  const y = tl.startY + (tl.targetY - tl.startY) * eased;
  const x = tl.startX + (tl.targetX - tl.startX) * eased;
  const zoom = 1 + (ZOOM_OUT_PEAK - 1) * zoomBell(t);

  const active = t < 1;
  STATE.lastFrame = { active, locked: true, progress: t, y, x, zoom };

  // Once the timeline finishes, drop it but keep `target` set so the globe
  // stays parked on the destination via `locked`.
  if (!active) {
    STATE.timeline = null;
  }

  return STATE.lastFrame;
}

/** Read the most recent frame without advancing the timeline. */
export function peekFocus(): GlobeFocusFrame {
  return STATE.lastFrame;
}

/** Whether a target is currently set (used by pin/arc reveal logic). */
export function hasFocusTarget(): boolean {
  return STATE.target !== null;
}
