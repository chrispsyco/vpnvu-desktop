import { contextBridge, ipcRenderer } from 'electron';

import { IpcRendererEventChannel } from './lib/ipc-event-channel';

contextBridge.exposeInMainWorld('ipc', IpcRendererEventChannel);

contextBridge.exposeInMainWorld('env', {
  // CI Playwright suite. Disables heavy visual surfaces (globe, map, view
  // transitions) so e2e runs stay fast and deterministic.
  e2e: process.env.CI === 'e2e',
  // Standard webpack/electron dev server.
  development: process.env.NODE_ENV === 'development',
  // Interactive `build:test` mock build (NODE_ENV=test). Surfaces dev-only
  // affordances (Developer tools entry, preview routes) without disabling
  // the visual surfaces that `e2e` turns off.
  mock: process.env.NODE_ENV === 'test',
  platform: process.platform,
});

contextBridge.exposeInMainWorld('windowControls', {
  close: () => ipcRenderer.send('window-close'),
  minimize: () => ipcRenderer.send('window-minimize'),
});

if (process.env.CI) {
  contextBridge.exposeInMainWorld('__REACT_DEVTOOLS_GLOBAL_HOOK__', { isDisabled: true });
}
