/**
 * Standalone bundle do globo VPN.vu pro Android.
 *
 * Reusa o mesmo `GlobeScene` do desktop · monta dentro de uma `MemoryRouter`
 * pra satisfazer hooks de react-router usados em sub-componentes.
 *
 * Expõe `window.GlobeAPI` para o WebView nativo Android controlar:
 *
 *   GlobeAPI.setLocation(lat, lng)           // anima câmera até o ponto
 *   GlobeAPI.setConnectionState(state)       // 'idle'|'connecting'|'connected'|'error'
 *   GlobeAPI.clear()                         // limpa o location lock (idle drift)
 *   GlobeAPI.getState()                      // retorna estado atual em JSON · debug
 *
 * Recursos defensivos:
 *
 * - **Save state**: cada mutação persiste o `currentState` em `sessionStorage`,
 *   restaurado no boot · sobrevive a WebView reload/background-kill no Android
 *   sem perder a localização ativa nem o estado de conexão.
 *
 * - **Visibility pause**: `document.visibilityState === 'hidden'` (app em
 *   background) já é detectado pelo `usePauseWhenHidden` upstream · o
 *   `<Canvas frameloop>` muda pra `'never'` enquanto invisível.
 *
 * - **ErrorBoundary**: qualquer crash do R3F é capturado e exibido como
 *   tela vazia (em vez de tela branca / app crash). Estado é preservado
 *   pra retry on visibility change.
 *
 * - **Stub APIs Electron-only**: define no-op de `window.electron` e
 *   `window.ipcRenderer` defensivo · caso algum sub-componente importe
 *   indireto, não crash.
 */
import { createRoot } from 'react-dom/client';
import { Component, StrictMode, useEffect, useState, type ReactNode, type ErrorInfo } from 'react';
import { MemoryRouter } from 'react-router';

import { GlobeScene } from '../src/renderer/components/globe/GlobeScene';
import type { ActiveServerPinState } from '../src/renderer/components/globe/ActiveServerPin';
import { useFocusOnLocation } from '../src/renderer/lib/globe/useFocusOnLocation';

// ===== Stub Electron APIs (defensive · globe atual não usa) =====
declare global {
  interface Window {
    electron?: unknown;
    ipcRenderer?: unknown;
    GlobeAPI: GlobeAPI;
  }
}
if (typeof window !== 'undefined') {
  // Stub apenas se ausente · não sobrescreve em ambiente desktop real
  window.electron = window.electron ?? new Proxy({}, { get: () => () => undefined });
  window.ipcRenderer = window.ipcRenderer ?? new Proxy({}, { get: () => () => undefined });
}

// ===== Tipos =====
interface GlobeState {
  lat?: number;
  lng?: number;
  connectionState: ActiveServerPinState;
}

interface GlobeAPI {
  setLocation: (lat: number, lng: number) => void;
  setConnectionState: (state: ActiveServerPinState) => void;
  clear: () => void;
  getState: () => string;
}

// ===== Persistência de state (sobrevive WebView reload no Android) =====
const STATE_KEY = 'vpnvu.globe.state';

function loadState(): GlobeState {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) return { connectionState: 'idle' };
    const parsed = JSON.parse(raw) as GlobeState;
    // Validar shape · resilient a versões antigas do JSON
    return {
      lat: typeof parsed.lat === 'number' && isFinite(parsed.lat) ? parsed.lat : undefined,
      lng: typeof parsed.lng === 'number' && isFinite(parsed.lng) ? parsed.lng : undefined,
      connectionState: parsed.connectionState ?? 'idle',
    };
  } catch {
    return { connectionState: 'idle' };
  }
}

function persistState(state: GlobeState): void {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage cheio ou unavailable · sigamos sem persistir
  }
}

// ===== State management central =====
const listeners = new Set<(s: GlobeState) => void>();
let currentState: GlobeState = loadState();

function publish(next: GlobeState): void {
  currentState = next;
  persistState(next);
  listeners.forEach((fn) => fn(next));
}

// ===== React tree =====
function GlobeRoot() {
  const [state, setState] = useState<GlobeState>(currentState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  // PSYCO · dispara `requestFocus({lat, lng})` em globe-focus.ts toda vez que o
  // location muda. Sem isto, o GlobeRotator continua em idle-drift sem fazer
  // pan/zoom até o pin selecionado. No desktop o GlobeBackground.tsx wrappa
  // o GlobeScene e chama o mesmo hook · aqui é equivalente.
  useFocusOnLocation(state.lat, state.lng);

  return (
    <GlobeScene
      activeLat={state.lat}
      activeLng={state.lng}
      connectionState={state.connectionState}
      // PSYCO mobile · globo + câmera deslocados juntos pra cima · foco fica
      // no centro do espaço VISÍVEL (entre header e topo do card "CONNECTED").
      globeOffsetYOverride={0.55}
      // PSYCO mobile · tilt extra CONSTANTE (rad) pra subir o pin focado pro
      // centro visual sem mover o globo. -0.2 rad (~11° forward) · mesmo valor
      // que a fórmula antiga dava pra SP, mas agora igual pra TODA cidade (o
      // globe-focus já normaliza a latitude). Antes era sin(lat)*0.5, que
      // estourava cidades do norte (Londres +51°) pro Polo Norte.
      pinTiltFactor={-0.2}
    />
  );
}

/**
 * Captura crashes do R3F / Three.js · retorna fallback vazio sem matar a
 * WebView. O native bridge pode rodar `GlobeAPI.setLocation` de novo pra
 * forçar remount.
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class GlobeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[GlobeBundle] crash:', error, info);
  }

  componentDidMount() {
    // Resetar erro quando o app volta do background (visibility change)
    document.addEventListener('visibilitychange', this.maybeRecover);
  }

  componentWillUnmount() {
    document.removeEventListener('visibilitychange', this.maybeRecover);
  }

  maybeRecover = () => {
    if (this.state.hasError && document.visibilityState === 'visible') {
      this.setState({ hasError: false });
    }
  };

  render() {
    if (this.state.hasError) return null; // fundo deep-space (do <html>)
    return this.props.children;
  }
}

// ===== Expor API ao native bridge =====
window.GlobeAPI = {
  setLocation(lat: number, lng: number) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || !isFinite(lat) || !isFinite(lng)) {
      console.warn('[GlobeAPI] setLocation invalid:', lat, lng);
      return;
    }
    console.log('[GlobeAPI] setLocation', lat, lng);
    publish({ ...currentState, lat, lng });
  },
  setConnectionState(state: ActiveServerPinState) {
    console.log('[GlobeAPI] setConnectionState', state);
    publish({ ...currentState, connectionState: state });
  },
  clear() {
    console.log('[GlobeAPI] clear');
    publish({ ...currentState, lat: undefined, lng: undefined });
  },
  getState() {
    return JSON.stringify(currentState);
  },
};

// ===== Boot =====
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('root element missing');

createRoot(rootEl).render(
  <StrictMode>
    <GlobeErrorBoundary>
      <MemoryRouter>
        <GlobeRoot />
      </MemoryRouter>
    </GlobeErrorBoundary>
  </StrictMode>,
);

// ===== Anúncio ao native bridge que o JS terminou de carregar =====
// O WebView Android pode injetar um JSInterface chamado `AndroidGlobe`
// (ou similar) com método `onReady()` · chamamos pra sinalizar que a API
// está pronta pra receber updates.
if (typeof (window as unknown as { AndroidGlobe?: { onReady?: () => void } }).AndroidGlobe?.onReady === 'function') {
  (window as unknown as { AndroidGlobe: { onReady: () => void } }).AndroidGlobe.onReady();
}
