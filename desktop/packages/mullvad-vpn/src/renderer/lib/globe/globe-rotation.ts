/**
 * Shared rotation state for every globe layer (mesh, grid, borders, volcanoes).
 * One driver (GlobeRotator) writes here per frame using a non-uniform speed
 * curve; everyone else just reads.
 *
 * Pitch (rotation X) is also tracked here so a focus hook can tilt the globe
 * to bring a specific latitude up to the viewport centre.
 */

const STATE = { y: 0, x: 0 };

export function getGlobeRotationY(): number {
  return STATE.y;
}

export function setGlobeRotationY(v: number): void {
  STATE.y = v;
}

export function getGlobeRotationX(): number {
  return STATE.x;
}

export function setGlobeRotationX(v: number): void {
  STATE.x = v;
}
