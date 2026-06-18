/**
 * VPN.vu canonical server list.
 *
 * Feeds the 3D globe (every server gets a permanent pin via VolcanoMarkers,
 * not just the active one) + connection UI. Add new entries here as relays
 * are deployed — production also gets the truth from the daemon / api.vpn.vu
 * relay list, but the globe pins are driven by THIS list.
 *
 * Coordinates DEVEM bater com `CITY_COORDS` no backend
 * (`src/routes/mullvad-compat/app.ts`) — o pin ativo usa as coords que o
 * daemon reporta (city-label), e o VolcanoMarkers deduplica por coords
 * (matchesActive, tolerância 0.5°). Coords divergentes → pin duplicado.
 *
 * Coordinates: decimal degrees, 4-5 places (city centers).
 * IDs follow the daemon relay hostname pattern (`<cc>-<city>-NNN`) so the
 * globe's active-pin lookup stays in sync with the daemon's selection.
 */

import { useEffect, useState } from 'react';

import type { VpnvuServerApiEntry } from '../../../shared/vpnvu-server-api';

export interface VpnvuServer {
  /** Stable identifier — must match the daemon relay hostname (e.g. `br-sao-001`). */
  readonly id: string;
  /** Public hostname clients connect to. */
  readonly hostname: string;
  /** Country name in pt-BR (UI is bilingual; pt-BR is the default audience). */
  readonly country: string;
  /** ISO-3166-1 alpha-2 country code (uppercase). */
  readonly countryCode: string;
  /** City name (display). */
  readonly city: string;
  /** Latitude in decimal degrees. */
  readonly lat: number;
  /** Longitude in decimal degrees. */
  readonly lng: number;
  /**
   * Optional visual-only latitude used by the globe renderer when the real
   * coordinate sits visually on top of a neighbor pin (e.g. Toronto and NYC).
   * Pickers, daemon lookups, and lat/lng filters still use `lat`/`lng`.
   */
  readonly displayLat?: number;
  /** Optional visual-only longitude (see `displayLat`). */
  readonly displayLng?: number;
  /** Flag emoji for the country. */
  readonly flag: string;
  /** Provider tag. Only `vpnvu` for now (Mullvad fork is internal infra). */
  readonly provider: 'vpnvu';
  /** Whether the server is currently advertising as online. */
  readonly online: boolean;
  /** Highlighted on the globe and surfaced first in pickers. */
  readonly popular: boolean;
  /**
   * Product tags rendered as badges in the location picker. Known values:
   * `STREAMING` (residential exit, passes Netflix/Disney) and `PRIVACY`
   * (datacenter exit). Comes from the live API; empty when none.
   */
  readonly tags: readonly string[];
}

// Lista FALLBACK · usada offline / enquanto o fetch de /v1/servers não responde.
// Espelha os relays atuais (ids = `<cc>-<city>` igual ao endpoint e ao código de
// localização do daemon). A fonte da verdade em runtime é api.vpn.vu/v1/servers
// (ver `useVpnvuServers`) — então adicionar servidor NÃO exige rebuild do app.
export const FALLBACK_SERVERS: ReadonlyArray<VpnvuServer> = [
  {
    id: 'br-sao',
    hostname: 'vpnvu-br-sao-001.vpn.vu',
    country: 'Brasil',
    countryCode: 'BR',
    city: 'São Paulo',
    lat: -23.5505,
    lng: -46.6333,
    flag: '🇧🇷',
    provider: 'vpnvu',
    online: true,
    popular: true,
    tags: ['PRIVACY'],
  },
  {
    id: 'us-lax',
    hostname: 'vpnvu-us-lax-001.vpn.vu',
    country: 'Estados Unidos',
    countryCode: 'US',
    city: 'Los Angeles',
    lat: 34.0522,
    lng: -118.2437,
    flag: '🇺🇸',
    provider: 'vpnvu',
    online: true,
    popular: false,
    tags: ['STREAMING', 'PRIVACY'],
  },
  {
    id: 'gb-lon',
    hostname: 'vpnvu-gb-lon-001.vpn.vu',
    country: 'Reino Unido',
    countryCode: 'GB',
    city: 'Londres',
    lat: 51.5074,
    lng: -0.1278,
    flag: '🇬🇧',
    provider: 'vpnvu',
    online: true,
    popular: false,
    tags: ['STREAMING', 'PRIVACY'],
  },
  {
    id: 'jp-tyo',
    hostname: 'vpnvu-jp-tyo-001.vpn.vu',
    country: 'Japão',
    countryCode: 'JP',
    city: 'Tóquio',
    lat: 35.6762,
    lng: 139.6503,
    flag: '🇯🇵',
    provider: 'vpnvu',
    online: true,
    popular: false,
    tags: ['STREAMING', 'PRIVACY'],
  },
] as const;

// Endpoint público (CORS *) que serve a lista viva · vale pra desktop (renderer)
// E pro WebView Android do globo. Hardcode prod: os pins são os mesmos
// independente de qual conta/backend o cliente usa.
const SERVERS_URL = 'https://api.vpn.vu/v1/servers';

// Cache em memória · começa no fallback, é trocado quando o fetch responde.
let currentServers: ReadonlyArray<VpnvuServer> = FALLBACK_SERVERS;
const listeners = new Set<(s: ReadonlyArray<VpnvuServer>) => void>();
let fetchStarted = false;

// Emoji da bandeira a partir do ISO-3166 alpha-2 (regional indicator symbols) ·
// dinâmico, cobre qualquer país novo sem tabela manual.
function flagFromCountryCode(cc: string): string {
  const code = cc.trim().toUpperCase();
  if (code.length !== 2) return '🌐';
  return String.fromCodePoint(...[...code].map((ch) => 0x1f1e6 + (ch.charCodeAt(0) - 65)));
}

// Shape of one `/v1/servers` entry · shared with the main process (which now
// does the actual fetch — see `setServersFetcher`).
type ServersApiEntry = VpnvuServerApiEntry;

function mapApiEntry(e: ServersApiEntry): VpnvuServer {
  return {
    id: e.id,
    hostname: `vpnvu-${e.id}-001.vpn.vu`,
    country: e.country,
    countryCode: e.countryCode,
    city: e.city,
    lat: e.lat,
    lng: e.lng,
    flag: flagFromCountryCode(e.countryCode),
    provider: 'vpnvu',
    online: true,
    popular: e.id === 'br-sao',
    // Tags vêm da API viva. Enquanto o backend não serve a coluna `tags`
    // (transição) ela volta vazia → herdamos as conhecidas do FALLBACK pelo id
    // pra não perder os badges. Assim que a API mandar tags reais, elas mandam.
    tags:
      Array.isArray(e.tags) && e.tags.length > 0
        ? e.tags
        : (FALLBACK_SERVERS.find((s) => s.id === e.id)?.tags ?? []),
  };
}

// Como a lista viva é obtida · injetável. O DEFAULT faz `fetch` direto, o que
// funciona no WebView Android (globe-bundle) e em qualquer browser. No renderer
// do Electron desktop o fetch é bloqueado (postura "renderer sem rede"), então
// `app.tsx` injeta no boot um fetcher que pede a lista ao main via IPC. Por isso
// este módulo NÃO importa nada de Electron — assim continua carregável no Android.
type ServersFetcher = () => Promise<ServersApiEntry[]>;

const defaultFetcher: ServersFetcher = async () => {
  const res = await fetch(SERVERS_URL);
  if (!res.ok) return [];
  const data = (await res.json()) as { servers?: ServersApiEntry[] };
  return Array.isArray(data?.servers) ? data.servers : [];
};

let serversFetcher: ServersFetcher = defaultFetcher;

/**
 * Sobrescreve a fonte da lista viva. O renderer do Electron chama isto no boot
 * com um fetcher que vai ao main via IPC (`IpcRendererEventChannel.vpnvuServers
 * .get`), pois o renderer não pode bater na rede direto. Não chamado no Android
 * → permanece o `defaultFetcher` (fetch direto).
 */
export function setServersFetcher(fetcher: ServersFetcher): void {
  serversFetcher = fetcher;
}

async function fetchServersOnce(): Promise<void> {
  if (fetchStarted) return;
  fetchStarted = true;
  try {
    const raw = await serversFetcher();
    const mapped = raw.filter((e) => isFinite(e?.lat) && isFinite(e?.lng)).map(mapApiEntry);
    if (mapped.length) {
      currentServers = mapped;
      listeners.forEach((fn) => fn(currentServers));
    }
  } catch {
    // Offline / endpoint fora → mantém o FALLBACK. O globo nunca fica sem pins.
  }
}

// Hook React · dispara o fetch uma vez e re-renderiza quando a lista viva chega.
// Componentes do globo (VolcanoMarkers) usam isto pra ganhar os pins novos sem
// rebuild. getServerById/getDefaultServer continuam síncronos sobre o cache.
export function useVpnvuServers(): ReadonlyArray<VpnvuServer> {
  const [list, setList] = useState<ReadonlyArray<VpnvuServer>>(currentServers);
  useEffect(() => {
    listeners.add(setList);
    // Sincroniza caso o fetch já tenha completado antes deste mount (setState
    // com o mesmo valor é no-op no React, então é seguro chamar sempre).
    setList(currentServers);
    void fetchServersOnce();
    return () => {
      listeners.delete(setList);
    };
  }, []);
  return list;
}

/** Back-compat · alguns componentes referenciam a constante direto. Aponta pro
 *  fallback (lista inicial); quem precisa de reatividade usa useVpnvuServers(). */
export const VPNVU_SERVERS: ReadonlyArray<VpnvuServer> = FALLBACK_SERVERS;

/** Lookup por id estável · lê o cache vivo (já inclui servidores recém-buscados). */
export function getServerById(id: string): VpnvuServer | undefined {
  return currentServers.find((server) => server.id === id);
}

/**
 * Servidor default quando o usuário ainda não escolheu · primeiro `popular`
 * (SP por design). Garante retorno: cai pro primeiro do cache, senão o fallback.
 */
export function getDefaultServer(): VpnvuServer {
  return (
    currentServers.find((server) => server.popular) ?? currentServers[0] ?? FALLBACK_SERVERS[0]
  );
}
