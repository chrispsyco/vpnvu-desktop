import { Menu, Tray } from 'electron';

import { TunnelState } from '../shared/daemon-rpc-types';
import { TrayIcon } from './tray-icon';

// Initial image is shown before the daemon reports its first tunnelState.
// Default to red disconnected — visually unambiguous and matches the most
// common starting condition (app launch with no active tunnel).
function getInitialIcon() {
  return new TrayIcon('tray-disconnected');
}

export interface TrayCallbacks {
  // Left-click toggle: open the window if hidden, hide if visible.
  onClick: () => void;
  // Right-click menu entry "Abrir VPN.vu" — always opens, never toggles.
  onShow: () => void;
  // Right-click menu entry "Sair" — fully quits the app (disconnects too).
  onQuit: () => void;
}

export function createTray(callbacks: TrayCallbacks, initialState?: TunnelState) {
  const initialIcon = getInitialIcon();
  const tray = new Tray(initialIcon.toNativeImage());

  tray.setToolTip('VPN.vu');
  // Double-click on the tray icon adds a perceptible delay before the first
  // click is processed (Electron quirk on Windows). Single-click is enough.
  tray.setIgnoreDoubleClickEvents(true);
  tray.on('click', callbacks.onClick);

  updateTrayContextMenu(tray, initialState, callbacks);

  return tray;
}

// Rebuild the context menu so the status label reflects the current tunnel
// state. Electron's tray menu can't be mutated in place — the cheap path is
// to rebuild and call setContextMenu again each time the state changes.
export function updateTrayContextMenu(
  tray: Tray,
  tunnelState: TunnelState | undefined,
  callbacks: TrayCallbacks,
) {
  const statusLabel = labelForTunnelState(tunnelState);
  // Also update the tooltip so hovering shows the status without opening
  // the menu — matches what users expect from desktop VPN apps.
  tray.setToolTip(`VPN.vu · ${statusLabel}`);

  const menu = Menu.buildFromTemplate([
    { label: `Status: ${statusLabel}`, enabled: false },
    { type: 'separator' },
    { label: 'Abrir VPN.vu', click: callbacks.onShow },
    { type: 'separator' },
    { label: 'Sair', click: callbacks.onQuit },
  ]);
  tray.setContextMenu(menu);
}

// PT-BR labels because the rest of the UI defaults to PT-BR for the BR/LATAM
// target audience. If we later switch to English defaults, replace these
// with `i18n.gettext(...)` calls — the strings themselves shouldn't move
// into the localization bundle yet since they're only consumed by the OS
// tray menu (which isn't React-rendered).
function labelForTunnelState(tunnelState: TunnelState | undefined): string {
  if (!tunnelState) return 'Desconectado';
  switch (tunnelState.state) {
    case 'connected':
      return 'Conectado';
    case 'connecting':
      return 'Conectando…';
    case 'disconnecting':
      return 'Desconectando…';
    case 'disconnected':
      return tunnelState.lockedDown ? 'Bloqueado' : 'Desconectado';
    case 'error':
      return 'Erro';
  }
}
