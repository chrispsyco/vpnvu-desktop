import { useEffect } from 'react';

import { requestFocus } from './globe-focus';

/**
 * Bind a (lat, lng) pair to the globe focus target. When `lat`/`lng` are both
 * finite numbers, the globe runs a zoom-out → pan → zoom-in animation toward
 * that point. Pass `undefined`/`null` (or NaN) to release control.
 *
 * The focus STATE in `globe-focus.ts` is a module-level singleton — it
 * survives React unmounts. We deliberately do NOT call `clearFocus()` on
 * unmount: navigating to Account/Settings unmounts MainView (and the globe
 * with it), and clearing the lock would force the next mount to re-run the
 * full focus animation from idle drift to the same destination.
 * `requestFocus` itself no-ops when the coord hasn't changed, so re-mounting
 * is free.
 */
export function useFocusOnLocation(lat: number | undefined, lng: number | undefined): void {
  useEffect(() => {
    if (typeof lat === 'number' && typeof lng === 'number' && isFinite(lat) && isFinite(lng)) {
      requestFocus({ lat, lng });
    }
  }, [lat, lng]);
}
