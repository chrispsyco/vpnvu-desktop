import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

import { getDefaultSettings } from '../../../src/main/default-settings';
import { changeIpcWebContents, IpcMainEventChannel } from '../../../src/main/ipc-event-channel';
import { loadTranslations } from '../../../src/main/load-translations';
import {
  DeviceState,
  IAccountData,
  IAppVersionInfo,
  ILocation,
} from '../../../src/shared/daemon-rpc-types';
import { messages, relayLocations } from '../../../src/shared/gettext';
import { IGuiSettingsState } from '../../../src/shared/gui-settings-state';
import { ITranslations, MacOsScrollbarVisibility } from '../../../src/shared/ipc-schema';
import { ICurrentAppVersionInfo } from '../../../src/shared/ipc-types';
import { mockData } from '../mock-data';

const DEBUG = true;
const TEST_SHOW_WINDOW = process.env.TEST_SHOW_WINDOW === '1';
const CI_E2E = process.env.CI === 'e2e';

class ApplicationMain {
  private guiSettings: IGuiSettingsState = {
    preferredLocale: 'pt',
    autoConnect: false,
    enableSystemNotifications: true,
    monochromaticIcon: false,
    startMinimized: false,
    unpinnedWindow: process.platform !== 'win32' && process.platform !== 'darwin',
    browsedForSplitTunnelingApplications: [],
    changelogDisplayedForVersion: '',
    updateDismissedForVersion: '',
    animateMap: true,
  };

  private settings = (() => {
    const s = getDefaultSettings();
    // Default to Brasil/São Paulo so the globe focuses on BR on first launch
    // (primary audience is pt-BR) and the ReconnectButton can shuffle between
    // BR cities without the user having to pick one first.
    (s.relaySettings as { normal: { location: unknown } }).normal.location = {
      only: { country: 'br', city: 'sao' },
    };
    return s;
  })();

  private translations: ITranslations = { locale: this.guiSettings.preferredLocale };

  private isConnectedToDaemon = true;

  private accountData: IAccountData = {
    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  private deviceState: DeviceState = {
    type: 'logged out',
  };

  private currentVersion: ICurrentAppVersionInfo = {
    gui: '2000.1',
    daemon: '2000.1',
    isConsistent: true,
    isBeta: false,
  };
  private upgradeVersion: IAppVersionInfo = {
    supported: true,
    suggestedUpgrade: undefined,
  };

  private location: ILocation = {
    country: 'Brasil',
    city: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    mullvadExitIp: false,
  };

  public constructor() {
    app.enableSandbox();
    app.on('ready', this.onReady);
  }

  private onReady = async () => {
    this.updateCurrentLocale('pt');

    const window = new BrowserWindow({
      useContentSize: true,
      width: 405,
      height: 720,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      show: DEBUG,
      frame: false,
      // Transparent window only so the CSS-side rounded corners of #app can
      // peek through at the four corners. The app surface itself is fully
      // opaque cyan — no acrylic, no see-through.
      transparent: true,
      backgroundColor: '#00000000',
      roundedCorners: true,
      hasShadow: true,
      webPreferences: {
        offscreen: CI_E2E && !TEST_SHOW_WINDOW,
        preload: path.join(import.meta.dirname, 'preload.cjs'),
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        nodeIntegrationInSubFrames: false,
        sandbox: true,
        contextIsolation: true,
        spellcheck: false,
        devTools: DEBUG,
      },
    });

    changeIpcWebContents(window.webContents);

    ipcMain.on('window-close', () => window.close());
    ipcMain.on('window-minimize', () => window.minimize());

    this.registerIpcListeners();

    await window.loadFile(path.join(import.meta.dirname, 'index.html'));

    if (process.argv.includes('--show-window')) {
      window.show();
    }

    if (DEBUG) {
      window.webContents.openDevTools({ mode: 'detach' });
    }
  };

  private registerIpcListeners() {
    IpcMainEventChannel.state.handleGet(() => ({
      isConnected: this.isConnectedToDaemon,
      autoStart: false,
      accountData: this.accountData,
      accountHistory: undefined,
      tunnelState: { state: 'disconnected', location: this.location, lockedDown: false },
      settings: this.settings,
      isPerformingPostUpgrade: false,
      deviceState: this.deviceState,
      relayList: {
        relayList: mockData.relayList,
        wireguardEndpointData: mockData.wireguardEndpointData,
      },
      currentVersion: this.currentVersion,
      upgradeVersion: this.upgradeVersion,
      guiSettings: this.guiSettings,
      translations: this.translations,
      splitTunnelingApplications: [],
      macOsScrollbarVisibility: MacOsScrollbarVisibility.whenScrolling,
      changelog: [],
      navigationHistory: undefined,
      scrollPositions: {},
      isMacOs13OrNewer: true,
    }));

    IpcMainEventChannel.guiSettings.handleSetPreferredLocale((locale) => {
      this.updateCurrentLocale(locale);
      IpcMainEventChannel.guiSettings.notify?.(this.guiSettings);
      return Promise.resolve(this.translations);
    });

    // Fake login: any 16-digit number works
    IpcMainEventChannel.account.handleLogin(async (accountNumber: string) => {
      await new Promise((r) => setTimeout(r, 600));
      this.deviceState = {
        type: 'logged in',
        accountAndDevice: {
          accountNumber,
          device: {
            id: 'mock-device-1',
            name: 'Testing Mole',
            created: new Date(),
          },
        },
      };
      IpcMainEventChannel.account.notifyDevice?.({
        type: 'logged in',
        deviceState: this.deviceState as Extract<DeviceState, { type: 'logged in' }>,
      });
      return undefined;
    });

    // Fake create account: generates random 16-digit number
    IpcMainEventChannel.account.handleCreate(async () => {
      await new Promise((r) => setTimeout(r, 800));
      const accountNumber = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 10),
      ).join('');
      this.deviceState = {
        type: 'logged in',
        accountAndDevice: {
          accountNumber,
          device: {
            id: 'mock-device-1',
            name: 'Testing Mole',
            created: new Date(),
          },
        },
      };
      IpcMainEventChannel.account.notifyDevice?.({
        type: 'logged in',
        deviceState: this.deviceState as Extract<DeviceState, { type: 'logged in' }>,
      });
      return accountNumber;
    });

    IpcMainEventChannel.account.handleLogout(async () => {
      await new Promise((r) => setTimeout(r, 300));
      this.deviceState = { type: 'logged out' };
      IpcMainEventChannel.account.notifyDevice?.({
        type: 'logged out',
        deviceState: this.deviceState as Extract<DeviceState, { type: 'logged out' }>,
      });
    });

    IpcMainEventChannel.account.handleListDevices(async () => {
      return [
        {
          id: 'mock-device-1',
          name: 'Testing Mole',
          created: new Date(),
        },
      ];
    });

    IpcMainEventChannel.account.handleUpdateData(() => Promise.resolve());
    IpcMainEventChannel.account.handleGetWwwAuthToken(() => Promise.resolve('mock-www-token'));
    IpcMainEventChannel.account.handleSubmitVoucher(async (voucherCode: string) => {
      await new Promise((r) => setTimeout(r, 500));
      const normalized = voucherCode.replace(/\s+/g, '').toUpperCase();
      // Magic voucher: "1111 1111 1111 1111" adds 365 days
      if (normalized === '1111111111111111') {
        const secondsAdded = 365 * 24 * 60 * 60;
        const currentExpiryMs = this.accountData.expiry ? new Date(this.accountData.expiry).getTime() : Date.now();
        const baseMs = Math.max(currentExpiryMs, Date.now());
        const newExpiry = new Date(baseMs + secondsAdded * 1000).toISOString();
        this.accountData = { expiry: newExpiry };
        // Note: NOT notifying via account.notify here — the success response
        // already carries `newExpiry`, and double-notifying causes a flash of
        // two success screens (account update + voucher redeemed).
        return { type: 'success' as const, newExpiry, secondsAdded };
      }
      return { type: 'invalid' as const };
    });
    IpcMainEventChannel.account.handleRemoveDevice(() => Promise.resolve());
    IpcMainEventChannel.accountHistory.handleClear(() => Promise.resolve());

    // Fake tunnel state machine: disconnected → connecting → connected
    const emitTunnelState = (state: 'disconnected' | 'connecting' | 'connected' | 'disconnecting') => {
      const tunnelState =
        state === 'connected'
          ? {
              state: 'connected' as const,
              details: {
                endpoint: {
                  address: '193.32.127.66:51820',
                  protocol: 'udp' as const,
                  quantumResistant: false,
                  tunnelType: 'wireguard' as const,
                  proxy: undefined,
                  entryEndpoint: undefined,
                  obfuscationEndpointInfo: undefined,
                  daita: false,
                },
                location: this.location,
              },
              featureIndicators: undefined,
            }
          : state === 'connecting'
          ? {
              state: 'connecting' as const,
              details: undefined,
              featureIndicators: undefined,
            }
          : state === 'disconnecting'
          ? { state: 'disconnecting' as const, details: 'nothing' as const, location: this.location, lockedDown: false }
          : { state: 'disconnected' as const, location: this.location, lockedDown: false };
      IpcMainEventChannel.tunnel.notify?.(tunnelState);
    };

    IpcMainEventChannel.tunnel.handleConnect(async () => {
      emitTunnelState('connecting');
      await new Promise((r) => setTimeout(r, 1200));
      emitTunnelState('connected');
    });

    IpcMainEventChannel.tunnel.handleReconnect(async () => {
      emitTunnelState('connecting');
      await new Promise((r) => setTimeout(r, 1200));
      emitTunnelState('connected');
    });

    IpcMainEventChannel.tunnel.handleDisconnect(async () => {
      emitTunnelState('disconnecting');
      await new Promise((r) => setTimeout(r, 600));
      emitTunnelState('disconnected');
    });

    // When user picks a server from the location list, update mock location
    // so globe focuses on the chosen city and the connection panel shows it.
    IpcMainEventChannel.settings.handleSetRelaySettings((relaySettings) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rs = relaySettings as any;
      const loc = rs?.normal?.location?.only;
      if (loc) {
        // Two shapes are accepted: flat `{ country, city }` from the standard
        // RelayLocationCity, and the legacy nested `{ city: { country, city }}`
        // / `{ hostname: { country, city, hostname }}`. Try the flat form first.
        const countryCode =
          (typeof loc.country === 'string' ? loc.country : undefined) ??
          loc.city?.country ??
          loc.hostname?.country;
        const cityCode =
          (typeof loc.city === 'string' ? loc.city : undefined) ??
          loc.city?.city ??
          loc.hostname?.city;
        const country = mockData.relayList.countries.find((c) => c.code === countryCode);
        const city = country
          ? cityCode
            ? country.cities.find((ci) => ci.code === cityCode)
            : country.cities[0]
          : undefined;
        if (country && city) {
          this.location = {
            country: country.name,
            city: city.name,
            latitude: city.latitude,
            longitude: city.longitude,
            mullvadExitIp: true,
          };
          // Re-emit disconnected tunnel state with new location so globe
          // focuses on the chosen city even before user hits Connect.
          IpcMainEventChannel.tunnel.notify?.({
            state: 'disconnected',
            location: this.location,
            lockedDown: false,
          });
        }
      }
      return Promise.resolve();
    });
  }

  private updateCurrentLocale(locale: string) {
    this.guiSettings.preferredLocale = locale;

    const messagesTranslations = loadTranslations(this.guiSettings.preferredLocale, messages);
    const relayLocationsTranslations = loadTranslations(
      this.guiSettings.preferredLocale,
      relayLocations,
    );

    this.translations = {
      locale: this.guiSettings.preferredLocale,
      messages: messagesTranslations,
      relayLocations: relayLocationsTranslations,
    };
  }
}

new ApplicationMain();
