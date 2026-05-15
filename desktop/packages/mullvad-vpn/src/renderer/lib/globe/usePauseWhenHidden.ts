import { useEffect, useState } from 'react';

/**
 * Returns `true` when the window/document is hidden (tab in background,
 * Electron window minimised to tray, etc).
 *
 * Used by GlobeScene to flip the R3F `frameloop` to `never` while hidden,
 * which stops `useFrame` callbacks and the requestAnimationFrame pump.
 * That recovers ~all the CPU/GPU the globe consumes when the user pins
 * the tray and walks away.
 */
export function usePauseWhenHidden(): boolean {
  const [hidden, setHidden] = useState(
    typeof document !== 'undefined' ? document.hidden : false,
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const onChange = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onChange);

    // Also react to explicit window blur/focus — Electron tray windows may
    // not always emit visibilitychange when hidden behind another app on
    // some platforms, but blur/focus is reliable.
    const onBlur = () => setHidden(true);
    const onFocus = () => setHidden(false);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return hidden;
}
