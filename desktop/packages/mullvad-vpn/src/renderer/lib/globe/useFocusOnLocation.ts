import { useEffect } from 'react';

import { clearFocus, requestFocus } from './globe-focus';

/**
 * Bind a (lat, lng) pair to the globe focus target. When `lat`/`lng` are both
 * finite numbers, the globe runs a zoom-out → pan → zoom-in animation toward
 * that point. Pass `undefined`/`null` (or NaN) to release control.
 *
 * The hook only triggers a new transition when the coordinates change — it
 * does NOT clear-then-set on every render, which would have caused a one-frame
 * idle stall (visible as a "stutter") between transitions.
 */
export function useFocusOnLocation(lat: number | undefined, lng: number | undefined): void {
  useEffect(() => {
    if (typeof lat === 'number' && typeof lng === 'number' && isFinite(lat) && isFinite(lng)) {
      requestFocus({ lat, lng });
    }
  }, [lat, lng]);

  // Only release on full unmount — switching coordinates re-runs the effect
  // above without dropping the lock in between.
  useEffect(() => {
    return () => clearFocus();
  }, []);
}
