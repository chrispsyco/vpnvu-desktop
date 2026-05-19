import { IpcRendererEventChannel } from '../../src/renderer/lib/ipc-event-channel';

// The ViewTransition types can be removed from here whenever TS adds support for them.
interface ViewTransition {
  readonly ready: Promise<void>;
  readonly finished: Promise<void>;
}

declare global {
  interface Window {
    ipc: typeof IpcRendererEventChannel;
    env: {
      platform: NodeJS.Platform;
      development: boolean;
      // True only inside the Playwright headless CI suite. Disables heavy
      // visual surfaces (globe Canvas, map, view transitions) so the e2e
      // pipeline stays fast and deterministic.
      e2e: boolean;
      // True for the interactive `build:test` mock build that we launch
      // locally to QA the rebrand. Distinct from `e2e` so we can show
      // dev-only affordances (Developer tools entry) without disabling
      // the surfaces e2e turns off.
      mock: boolean;
    };
    e2e: { location: string };
  }

  // The ViewTransition types can be removed from here whenever TS adds support for them.
  interface Document {
    startViewTransition(callback: () => void): ViewTransition;
  }
}
