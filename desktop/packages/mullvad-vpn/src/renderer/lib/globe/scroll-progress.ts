/**
 * Lightweight scroll progress shared between scroll-driven scenes and R3F
 * components like ServerArcs / GlobeConnectors. The desktop app does not
 * scroll, but the hook is preserved so the components stay drop-in compatible
 * with the web source. Anyone driving an animation here can call
 * `setScrollProgress` directly; default value is 1 (fully revealed).
 */

const STATE = { value: 1 };

export function setScrollProgress(v: number): void {
  STATE.value = Math.max(0, Math.min(1, v));
}

export function getScrollProgress(): number {
  return STATE.value;
}
