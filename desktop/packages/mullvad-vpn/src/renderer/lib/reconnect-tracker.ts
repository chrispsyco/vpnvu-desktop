import { useEffect, useState } from 'react';

/**
 * Tracks the most recent "reconnect" intent (e.g. ReconnectButton click) so UI
 * downstream can suppress transient daemon states that would otherwise cause
 * visual flashes.
 *
 * The daemon walks `connected → disconnecting → disconnected → connecting →
 * connected` whenever a reconnect is requested. The 1-2 frames spent in
 * `disconnected` flip ConnectionActionButton to the green ConnectButton in
 * between two red DisconnectButton renders — a noticeable flash on the small
 * tray-window viewport. Marking the reconnect as in-flight lets consumers
 * treat `disconnected` as `connecting` for a short window.
 */

const RECONNECT_HOLD_MS = 1500;

let lastReconnectAt = 0;
const listeners = new Set<() => void>();

export function markReconnectStarted(): void {
  lastReconnectAt = Date.now();
  listeners.forEach((fn) => fn());
}

export function isReconnectPending(): boolean {
  return Date.now() - lastReconnectAt < RECONNECT_HOLD_MS;
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useReconnectPending(): boolean {
  const [pending, setPending] = useState(isReconnectPending);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const scheduleExpiry = () => {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
      if (isReconnectPending()) {
        const elapsed = Date.now() - lastReconnectAt;
        timer = setTimeout(() => setPending(false), RECONNECT_HOLD_MS - elapsed + 10);
      }
    };

    const update = () => {
      setPending(true);
      scheduleExpiry();
    };

    scheduleExpiry();
    const unsubscribe = subscribe(update);

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return pending;
}
