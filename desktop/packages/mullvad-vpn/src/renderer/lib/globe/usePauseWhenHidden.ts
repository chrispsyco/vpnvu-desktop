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

// PSYCO · No Android o globo roda numa WebView decorativa atrás da UI Compose.
// Pausar o frameloop ali via visibilitychange/blur causava tela preta:
//  - `blur` dispara já no 1º frame (a WebView nunca detém o foco da window) e
//    pausava o globo permanentemente;
//  - na transição splash→connect a WebView é desanexada/reanexada (holder de
//    processo), o `visibilitychange`→hidden pausava o R3F e o →visible NÃO
//    re-disparava no reattach, deixando o `frameloop` preso em 'never' (o R3F
//    não retoma o loop de never→always sem um invalidate).
// Solução: na WebView Android nunca pausamos (sempre visível). A economia de GPU
// em background continua garantida porque o Chromium já pausa o
// requestAnimationFrame de páginas hidden, e o `WebView.onPause()` nativo pausa
// o renderer quando o app sai. O comportamento Electron desktop fica intacto.
const IS_ANDROID_WEBVIEW =
  typeof navigator !== 'undefined' &&
  /Android/.test(navigator.userAgent) &&
  /\bwv\b/.test(navigator.userAgent);

export function usePauseWhenHidden(): boolean {
  const [hidden, setHidden] = useState(
    !IS_ANDROID_WEBVIEW && typeof document !== 'undefined' ? document.hidden : false,
  );

  useEffect(() => {
    // Android WebView: nunca pausa (ver nota acima).
    if (IS_ANDROID_WEBVIEW || typeof document === 'undefined') return;

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
