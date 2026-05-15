import { useFrame } from '@react-three/fiber';

import {
  getGlobeRotationX,
  getGlobeRotationY,
  setGlobeRotationX,
  setGlobeRotationY,
} from '../../lib/globe/globe-rotation';
import { getFocusTarget } from '../../lib/globe/globe-focus';

/**
 * Approximate landmass density per visible longitude. Two soft bumps:
 * one wide one over Africa+Eurasia, one narrow one over the Americas.
 * Output: 0 (open ocean) — 1 (continent fully in view).
 */
function continentDensity(lngDeg: number): number {
  // Normalise to (-180, 180]
  const lng = (((lngDeg + 180) % 360) + 360) % 360 - 180;
  const eurasia = Math.exp(-Math.pow((lng - 50) / 70, 2));
  const americas = Math.exp(-Math.pow((lng + 80) / 35, 2));
  return Math.min(1, eurasia + americas * 0.65);
}

const BASE_SPEED = 0.085; // average rad/s (matches the previous constant feel)
const VARIATION = 0.32; // ±32% — subtle enough to read as "constant"

/** How fast the globe lerps onto a focus target (per second). */
const FOCUS_RATE = 1.6;
/** Once the residual angular distance is below this, snap and idle. */
const FOCUS_EPSILON = 0.002; // rad

/**
 * Given the model's current Y rotation, work out the longitude facing the
 * camera. At y=0 the prime-meridian-facing model puts lng≈270° in front of us;
 * rotating the model by +y radians shifts the visible lng by -y rad.
 */
function visibleLngFromY(y: number): number {
  return -((y * 180) / Math.PI) + 270;
}

/**
 * Convert a target longitude (deg) into the model rotation that brings it
 * onto the camera meridian.
 */
function yForLng(lngDeg: number): number {
  // visibleLngFromY(y) = lngDeg  ⇒  y = (270 - lngDeg) * π / 180
  return ((270 - lngDeg) * Math.PI) / 180;
}

/** Shortest signed difference from `a` to `b`, wrapped to (-π, π]. */
function wrapAngle(diff: number): number {
  const TWO_PI = Math.PI * 2;
  let d = diff % TWO_PI;
  if (d > Math.PI) d -= TWO_PI;
  if (d <= -Math.PI) d += TWO_PI;
  return d;
}

export function GlobeRotator() {
  useFrame((_, delta) => {
    const target = getFocusTarget();
    const y = getGlobeRotationY();
    const x = getGlobeRotationX();

    if (target) {
      // Goal Y: align target longitude with camera meridian.
      const targetY = yForLng(target.lng);
      // Goal X: tilt globe so target latitude sits on equator (rotate forward
      // by lat radians). Negative lat -> tilt back, positive -> tilt forward.
      const targetX = (target.lat * Math.PI) / 180;

      const dy = wrapAngle(targetY - y);
      const dx = targetX - x;
      const stepFactor = 1 - Math.exp(-FOCUS_RATE * delta);

      if (Math.abs(dy) < FOCUS_EPSILON && Math.abs(dx) < FOCUS_EPSILON) {
        setGlobeRotationY(targetY);
        setGlobeRotationX(targetX);
      } else {
        setGlobeRotationY(y + dy * stepFactor);
        setGlobeRotationX(x + dx * stepFactor);
      }
      return;
    }

    // Idle drift: vary speed by how much landmass is in front of us.
    const density = continentDensity(visibleLngFromY(y));
    // density 1 → 1 - VARIATION (slow over land);
    // density 0 → 1 + VARIATION (fast over ocean).
    const speedMult = 1 + VARIATION - density * VARIATION * 2;

    setGlobeRotationY(y + delta * BASE_SPEED * speedMult);
    // Slowly relax pitch back to 0 when nothing is steering.
    if (Math.abs(x) > FOCUS_EPSILON) {
      const stepFactor = 1 - Math.exp(-FOCUS_RATE * 0.5 * delta);
      setGlobeRotationX(x - x * stepFactor);
    } else if (x !== 0) {
      setGlobeRotationX(0);
    }
  });
  return null;
}
