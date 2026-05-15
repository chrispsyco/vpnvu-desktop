import { useEffect } from 'react';

import { setFocusTarget } from './globe-focus';

/**
 * Bind a (lat, lng) pair to the globe focus target. When `lat`/`lng` are both
 * finite numbers, the globe will lerp until that point sits at the camera
 * meridian. Pass `undefined`/`null` (or NaN) to release control and let the
 * globe go back to its idle drift.
 *
 * This hook is intentionally tiny — the heavy lifting lives in GlobeRotator,
 * which reads the focus target via `useFrame` so React never re-renders just
 * because the rotation changed.
 */
export function useFocusOnLocation(lat: number | undefined, lng: number | undefined): void {
  useEffect(() => {
    if (typeof lat === 'number' && typeof lng === 'number' && isFinite(lat) && isFinite(lng)) {
      setFocusTarget({ lat, lng });
    } else {
      setFocusTarget(null);
    }
    return () => {
      setFocusTarget(null);
    };
  }, [lat, lng]);
}
