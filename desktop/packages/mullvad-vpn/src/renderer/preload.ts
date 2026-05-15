import { contextBridge, ipcRenderer } from 'electron';

import { IpcRendererEventChannel } from './lib/ipc-event-channel';

contextBridge.exposeInMainWorld('ipc', IpcRendererEventChannel);

contextBridge.exposeInMainWorld('env', {
  e2e: process.env.CI,
  development: process.env.NODE_ENV === 'development',
  platform: process.platform,
});

contextBridge.exposeInMainWorld('windowControls', {
  close: () => ipcRenderer.send('window-close'),
  minimize: () => ipcRenderer.send('window-minimize'),
});

if (process.env.CI) {
  contextBridge.exposeInMainWorld('__REACT_DEVTOOLS_GLOBAL_HOOK__', { isDisabled: true });
}
