/**
 * Shared focus target for the globe — when set, GlobeRotator lerps the globe
 * rotation so the given (lat, lng) coordinate sits at the camera meridian
 * instead of free-spinning.
 *
 * The driver is intentionally lock-free / non-React: read at most once per
 * frame from useFrame, so a module-scoped state is faster and simpler than
 * piping through a context.
 */

export interface GlobeFocus {
  lat: number;
  lng: number;
}

const STATE: { target: GlobeFocus | null } = { target: null };

export function setFocusTarget(target: GlobeFocus | null): void {
  STATE.target = target;
}

export function getFocusTarget(): GlobeFocus | null {
  return STATE.target;
}
