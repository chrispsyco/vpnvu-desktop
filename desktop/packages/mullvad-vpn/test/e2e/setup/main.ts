import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';

import { getDefaultSettings } from '../../../src/main/default-settings';
import { changeIpcWebContents, IpcMainEventChannel } from '../../../src/main/ipc-event-channel';
import { loadTranslations } from '../../../src/main/load-translations';
import { urls } from '../../../src/shared/constants';
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
    // Mirrors production default so the mock build also routes through the
    // privacy disclaimer on first launch.
    hasAcceptedPrivacyDisclaimer: false,
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

  /**
   * Default disconnected location. Replaced at startup by `fetchGeoIpLocation`
   * if the user has internet — so the globe focuses on the user's real city
   * on first launch instead of always São Paulo. The BR/SP values stay as the
   * offline fallback since the primary audience is pt-BR.
   */
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

  /**
   * Resolve the user's approximate location via a free geo-IP service.
   * Capped at 2s so a slow/offline network never blocks app boot — on failure
   * we keep the hardcoded fallback. ipapi.co was picked over ip-api.com because
   * the latter is HTTP-only on the free tier and Electron rejects mixed
   * content from the file:// renderer.
   */
  private async fetchGeoIpLocation(): Promise<ILocation | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    try {
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
      });
      if (!response.ok) return null;
      const data = (await response.json()) as {
        latitude?: number;
        longitude?: number;
        country_name?: string;
        city?: string;
      };
      if (
        typeof data.latitude !== 'number' ||
        typeof data.longitude !== 'number' ||
        !isFinite(data.latitude) ||
        !isFinite(data.longitude)
      ) {
        return null;
      }
      return {
        country: data.country_name ?? 'Unknown',
        city: data.city ?? 'Unknown',
        latitude: data.latitude,
        longitude: data.longitude,
        mullvadExitIp: false,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private onReady = async () => {
    this.updateCurrentLocale('pt');

    const geo = await this.fetchGeoIpLocation();
    if (geo) {
      this.location = geo;
    }

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

    // Persist the privacy disclaimer accept flag in the mock GUI settings and
    // re-emit guiSettings so StateTriggeredNavigation re-evaluates the gate.
    IpcMainEventChannel.guiSettings.handleSetHasAcceptedPrivacyDisclaimer((accepted) => {
      console.log('[mock] setHasAcceptedPrivacyDisclaimer ->', accepted);
      this.guiSettings = { ...this.guiSettings, hasAcceptedPrivacyDisclaimer: accepted };
      IpcMainEventChannel.guiSettings.notify?.(this.guiSettings);
    });

    // Mirror the 5 GUI setting toggles surfaced by the User-interface-settings
    // view. Production registers these in src/main/settings.ts; the mock used
    // to silently drop them which made the toggles look broken (redux value
    // never updated even after click). Each handler mutates the local
    // guiSettings snapshot and re-notifies so the renderer's selector flips.
    IpcMainEventChannel.guiSettings.handleSetEnableSystemNotifications((flag: boolean) => {
      this.guiSettings = { ...this.guiSettings, enableSystemNotifications: flag };
      IpcMainEventChannel.guiSettings.notify?.(this.guiSettings);
    });
    IpcMainEventChannel.guiSettings.handleSetMonochromaticIcon((flag: boolean) => {
      this.guiSettings = { ...this.guiSettings, monochromaticIcon: flag };
      IpcMainEventChannel.guiSettings.notify?.(this.guiSettings);
    });
    IpcMainEventChannel.guiSettings.handleSetUnpinnedWindow((flag: boolean) => {
      this.guiSettings = { ...this.guiSettings, unpinnedWindow: flag };
      IpcMainEventChannel.guiSettings.notify?.(this.guiSettings);
    });
    IpcMainEventChannel.guiSettings.handleSetStartMinimized((flag: boolean) => {
      this.guiSettings = { ...this.guiSettings, startMinimized: flag };
      IpcMainEventChannel.guiSettings.notify?.(this.guiSettings);
    });
    IpcMainEventChannel.guiSettings.handleSetAnimateMap((flag: boolean) => {
      this.guiSettings = { ...this.guiSettings, animateMap: flag };
      IpcMainEventChannel.guiSettings.notify?.(this.guiSettings);
    });

    // Fake login: any 16-digit number works.
    // Account number prefix controls the mock expiry so we can exercise each
    // post-login state without rebuilding:
    //   - starts with `0` → expired 30 days ago → Out-of-time view
    //   - starts with `9` → no expiry at all   → empty CTA state on Account
    //   - anything else  → 30 days in the future → Main view (default)
    // Always pushes a fresh accountData via `notify` so the renderer's
    // expiry selector populates immediately (otherwise the Account row sits
    // on "Currently unavailable" until the user redeems a voucher).
    IpcMainEventChannel.account.handleLogin(async (accountNumber: string) => {
      await new Promise((r) => setTimeout(r, 600));

      if (accountNumber.startsWith('0')) {
        this.accountData = {
          expiry: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
      } else if (accountNumber.startsWith('9')) {
        // Same intent as `0` — a fresh account without time. We use a brand-new
        // expiry one second in the past instead of `undefined` so the renderer
        // marks `expiredState='expired'` (via UPDATE_ACCOUNT_EXPIRY), which then
        // routes via getNavigationBase → /main/expired. Setting `undefined`
        // here used to let the user reach Main and click Connect successfully,
        // which is wrong: an account with no time shouldn't tunnel.
        // To preview the Account-view *empty CTA* (renders only on
        // expiry===undefined), use the "Preview · Empty Account expiry" button
        // in Developer tools.
        this.accountData = {
          expiry: new Date(Date.now() - 1000).toISOString(),
        };
      } else {
        this.accountData = {
          expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
      }

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
      IpcMainEventChannel.account.notify?.(this.accountData);
      return undefined;
    });

    // Fake create account: generates random 16-digit number
    IpcMainEventChannel.account.handleCreate(async () => {
      console.log('[mock] handleCreate called');
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
      console.log('[mock] handleCreate notifying device, returning', accountNumber);
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
        // Notify so the AccountView re-reads expiry from Redux when the user
        // closes the success dialog. Without this the success response shows
        // the right new date but the account row stays on the stale value.
        IpcMainEventChannel.account.notify?.(this.accountData);
        return { type: 'success' as const, newExpiry, secondsAdded };
      }
      return { type: 'invalid' as const };
    });
    IpcMainEventChannel.account.handleRemoveDevice(() => Promise.resolve());
    IpcMainEventChannel.accountHistory.handleClear(() => Promise.resolve());

    // External URL handler — mirrors production behavior (src/main/index.ts).
    // Without this, "Buy more credit" / "FAQ" / etc throw "No handler registered
    // for 'app-openUrl'" and the openUrlWithAuth promise rejects unhandled.
    // Allowlist restricts to vpn.vu URLs declared in shared/constants/urls.
    IpcMainEventChannel.app.handleOpenUrl(async (url) => {
      if (Object.values(urls).find((allowedUrl) => url.startsWith(allowedUrl))) {
        await shell.openExternal(url);
      }
    });

    // File picker stub for split tunneling "Find another app". Production
    // proxies to Electron's `dialog.showOpenDialog`. In mock we always
    // cancel so the UI flow completes without surfacing a real picker (and
    // critically, without dropping an unhandled rejection that froze the
    // renderer when the IPC handler was missing entirely).
    IpcMainEventChannel.app.handleShowOpenDialog(async () => ({
      canceled: true,
      filePaths: [],
    }));

    // Split tunneling stubs — same rationale. The Settings view boots with
    // Split tunneling visible (on Windows). Without these handlers the
    // initial `getApplications` call rejects, the panel renders a broken
    // state, and clicking "Find another app" deadlocks the whole renderer
    // because the unhandled rejections pile up.
    IpcMainEventChannel.splitTunneling.handleGetApplications(async () => ({
      fromCache: false,
      applications: [],
    }));
    IpcMainEventChannel.splitTunneling.handleSetState(async () => undefined);
    IpcMainEventChannel.splitTunneling.handleAddApplication(async () => undefined);
    IpcMainEventChannel.splitTunneling.handleRemoveApplication(async () => undefined);
    IpcMainEventChannel.splitTunneling.handleForgetManuallyAddedApplication(
      async () => undefined,
    );
    IpcMainEventChannel.macOsSplitTunneling.handleNeedFullDiskPermissions(
      async () => false,
    );
    IpcMainEventChannel.linuxSplitTunneling.handleGetApplications(async () => []);
    IpcMainEventChannel.linuxSplitTunneling.handleLaunchApplication(
      async () => ({ success: true as const }),
    );

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

    // Treat connect/reconnect as a no-op when the mock account has no time
    // left. The real daemon rejects unauthorized accounts before bringing the
    // tunnel up; the mock previously let the user "connect" even with an
    // expired account, which contradicts the Out-of-time UX. We also re-emit
    // accountData so the renderer recomputes expiredState and the
    // StateTriggeredNavigation pushes to /main/expired.
    const isAccountUsable = () => {
      const expiry = this.accountData.expiry;
      return !!expiry && new Date(expiry).getTime() > Date.now();
    };

    IpcMainEventChannel.tunnel.handleConnect(async () => {
      if (!isAccountUsable()) {
        IpcMainEventChannel.account.notify?.(this.accountData);
        return;
      }
      emitTunnelState('connecting');
      await new Promise((r) => setTimeout(r, 1200));
      emitTunnelState('connected');
    });

    IpcMainEventChannel.tunnel.handleReconnect(async () => {
      if (!isAccountUsable()) {
        IpcMainEventChannel.account.notify?.(this.accountData);
        return;
      }
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
          // Push the new constraint into the mock settings so subsequent
          // reads (e.g. getLocationFromConstraints during reconnect) see the
          // chosen city instead of the previous one. Without this the redux
          // store kept the stale relaySettings and the connect/reconnect
          // flow snapped back to the original server.
          (this.settings.relaySettings as { normal: { location: unknown } }).normal.location = {
            only: { country: countryCode, city: cityCode },
          };
          IpcMainEventChannel.settings.notify?.(this.settings);
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

    // DNS options (content blockers + custom DNS) are a native daemon feature
    // in production. The mock just mirrors the new options into the settings
    // snapshot and re-notifies so the UI reflects each toggle immediately.
    IpcMainEventChannel.settings.handleSetDnsOptions((dns) => {
      this.settings.tunnelOptions = { ...this.settings.tunnelOptions, dns };
      IpcMainEventChannel.settings.notify?.(this.settings);
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
