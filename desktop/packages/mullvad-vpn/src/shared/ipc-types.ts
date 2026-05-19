import { Action, Location } from 'history';

import { TransitionType } from '../renderer/lib/history';

export interface ICurrentAppVersionInfo {
  gui: string;
  daemon?: string;
  isConsistent: boolean;
  isBeta: boolean;
}

export interface IWindowShapeParameters {
  arrowPosition?: number;
}

export type SuppressOutdatedVersionOption = {
  type: 'suppress-outdated-version-warning';
};

export type ScrollToAnchorId =
  | 'daita-enable-setting'
  | 'multihop-setting'
  | 'custom-dns-settings'
  | 'allow-lan-setting'
  | 'lockdown-mode-setting'
  | 'dns-blocker-setting'
  | 'mtu-setting'
  | 'obfuscation-setting'
  | 'port-setting'
  | 'mss-fix-setting'
  | 'quantum-resistant-setting';

export type ScrollToAnchorOption = {
  type: 'scroll-to-anchor';
  id: ScrollToAnchorId;
};

export type LocationStateOptions = SuppressOutdatedVersionOption | ScrollToAnchorOption;

export type IChangelog = Array<string>;

// VPN.vu fork: arbitrary string passed by a navigation source to signal
// the *reason* the user landed on a destination view, so the destination can
// adapt its CTAs/copy. Today the only producer is `LoginView` (button "criar
// conta") and the only consumer is `PrivacyDisclaimerView` (step 3 final CTA
// label + post-accept action). We keep it as an optional string union so new
// intents can be added without touching every route. Don't put PII here — it
// gets serialized to the persisted history snapshot.
export type LocationIntent = 'create-account';

export interface LocationState {
  scrollPosition: [number, number];
  expandedSections: Record<string, boolean>;
  transition: TransitionType;
  options?: LocationStateOptions[];
  intent?: LocationIntent;
}

export interface IHistoryObject {
  entries: Location<LocationState>[];
  index: number;
  lastAction: Action;
}

export type ScrollPositions = Record<string, [number, number]>;

export type DaemonStatus = 'start-requested' | 'running' | 'stopped';
