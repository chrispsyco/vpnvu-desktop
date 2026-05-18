import { useFrame } from '@react-three/fiber';

import {
  getGlobeRotationX,
  getGlobeRotationY,
  setGlobeRotationX,
  setGlobeRotationY,
} from '../../lib/globe/globe-rotation';
import { tickFocus } from '../../lib/globe/globe-focus';

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

/** How fast pitch relaxes back to 0 when idle (per second). */
const PITCH_RELAX_RATE = 0.8;
const PITCH_EPSILON = 0.002;

function visibleLngFromY(y: number): number {
  return -((y * 180) / Math.PI) + 270;
}

export function GlobeRotator() {
  useFrame((_, delta) => {
    // Clamp delta so a long stall (window minimised, GC pause) doesn't make
    // the focus animation snap forward by a full second.
    const dt = Math.min(delta, 0.05);

    const frame = tickFocus(dt);

    if (frame.active) {
      // Focus animation in flight — write eased rotation directly.
      setGlobeRotationY(frame.y);
      setGlobeRotationX(frame.x);
      return;
    }

    if (frame.locked) {
      // Parked on destination — don't touch rotation, no idle drift.
      return;
    }

    // Idle drift: speed varies with how much landmass is in front of us.
    const y = getGlobeRotationY();
    const x = getGlobeRotationX();
    const density = continentDensity(visibleLngFromY(y));
    const speedMult = 1 + VARIATION - density * VARIATION * 2;

    setGlobeRotationY(y + dt * BASE_SPEED * speedMult);

    // Slowly relax pitch back to 0 when nothing is steering.
    if (Math.abs(x) > PITCH_EPSILON) {
      const stepFactor = 1 - Math.exp(-PITCH_RELAX_RATE * dt);
      setGlobeRotationX(x - x * stepFactor);
    } else if (x !== 0) {
      setGlobeRotationX(0);
    }
  });
  return null;
}
