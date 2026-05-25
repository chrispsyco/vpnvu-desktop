import { Tray } from 'electron';

import log from '../shared/logging';
import { TrayIcon } from './tray-icon';

// Mullvad upstream type names — kept so the rest of `user-interface.ts` and
// its `trayIconType()` dispatcher don't need to change. Semantic mapping:
//   secured   -> green   (connected)
//   securing  -> orange  (connecting / disconnecting / locked-down disconnect)
//   unsecured -> red     (idle disconnected / blocking error)
export type TrayIconType = 'unsecured' | 'securing' | 'secured';

// Pulse cadence for the connecting state. 600 ms each frame -> 1.2 s cycle,
// fast enough to read as "working" without being distracting in the tray.
const PULSE_INTERVAL_MS = 600;

const STATE_TO_FILE: Record<TrayIconType, string> = {
  unsecured: 'tray-disconnected',
  securing: 'tray-connecting',
  secured: 'tray-connected',
};

// The pulse frame is rendered as a dimmer orange in the same shape, swapped
// in/out by the pulse timer while iconType === 'securing'.
const PULSE_FRAME = 'tray-connecting-pulse';

// Existing controller signature is preserved so the caller (user-interface.ts)
// keeps working untouched. monochromaticIcon and notificationIcon are accepted
// but ignored — the colored vulcao set is intentionally always-on regardless
// of the system theme. macOS Template convention doesn't apply because the
// color encodes connection state, not just shape.
export default class TrayIconController {
  private pulseTimer?: NodeJS.Timeout;
  // Alternates between the bright connecting frame and the dim pulse frame.
  private pulseShowsDimFrame = false;

  constructor(
    private tray: Tray,
    private iconTypeValue: TrayIconType,
    _monochromaticIcon: boolean,
    _notificationIcon: boolean,
  ) {
    this.renderForCurrentState();
  }

  public dispose() {
    this.stopPulse();
  }

  get iconType(): TrayIconType {
    return this.iconTypeValue;
  }

  // No-op shims: kept to preserve the existing public contract. Monochrome
  // and notification badge are not part of this design yet — when we add a
  // notification badge variant in the future we'll wire it back through here.
  public updateTheme(): Promise<void> {
    return Promise.resolve();
  }

  public setMonochromaticIcon(_monochromaticIcon: boolean) {
    // intentionally empty
  }

  public showNotificationIcon(_notificationIcon: boolean, _reason?: string) {
    // intentionally empty
  }

  // Called by user-interface.ts every time the tunnel state changes. Name
  // kept for API compatibility with the old keyframe animator — semantically
  // it now just swaps to a different icon and starts/stops the pulse.
  public animateToIcon(type: TrayIconType) {
    if (this.iconTypeValue === type) {
      return;
    }
    this.iconTypeValue = type;
    this.renderForCurrentState();
  }

  private renderForCurrentState() {
    if (this.iconTypeValue === 'securing') {
      this.startPulse();
    } else {
      this.stopPulse();
      this.setImage(STATE_TO_FILE[this.iconTypeValue]);
    }
  }

  private startPulse() {
    // Always show the bright frame first so transitions feel responsive.
    this.pulseShowsDimFrame = false;
    this.setImage(STATE_TO_FILE.securing);
    this.stopPulse();
    this.pulseTimer = setInterval(() => {
      this.pulseShowsDimFrame = !this.pulseShowsDimFrame;
      this.setImage(this.pulseShowsDimFrame ? PULSE_FRAME : STATE_TO_FILE.securing);
    }, PULSE_INTERVAL_MS);
  }

  private stopPulse() {
    if (this.pulseTimer) {
      clearInterval(this.pulseTimer);
      this.pulseTimer = undefined;
    }
  }

  private setImage(fileName: string) {
    try {
      const image = new TrayIcon(fileName).toNativeImage();
      this.tray.setImage(image);
    } catch (e) {
      const error = e as Error;
      log.error(`Failed to load tray icon "${fileName}":`, error.message);
    }
  }
}
