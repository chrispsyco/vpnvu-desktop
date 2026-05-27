/**
 * VPN.vu canonical server list.
 *
 * Phase 1 launch: only BR-SAO is provisioned. Add new entries here as
 * relays are deployed (production gets the truth from the daemon /
 * api.vpn.vu relay list — this file feeds the 3D globe + connection UI).
 *
 * Coordinates: decimal degrees, 4-5 places (city centers).
 * IDs follow the daemon relay hostname pattern (`<cc>-<city>-NNN`) so the
 * globe's active-pin lookup stays in sync with the daemon's selection.
 */

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
}

export const VPNVU_SERVERS: ReadonlyArray<VpnvuServer> = [
  // SP -- audiencia principal BR, edge router Sao Paulo backbone (ponto neutro PTT-SP).
  // Id casa com o relay real do daemon (`br-sao-001`) para que o ActiveServerPin
  // do globo destaque o pino certo quando o usuário conecta em BR-SAO.
  {
    id: 'br-sao-001',
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
  },
] as const;

/**
 * Lookup a server by stable id.
 * Returns `undefined` if the id is unknown.
 */
export function getServerById(id: string): VpnvuServer | undefined {
  return VPNVU_SERVERS.find((server) => server.id === id);
}

/**
 * Default server used when the user has not picked one yet.
 * First server marked `popular: true` (Sao Paulo by design).
 *
 * Guaranteed to return a server because the canonical list always
 * contains at least one popular entry (br-sao-001).
 */
export function getDefaultServer(): VpnvuServer {
  const fallback = VPNVU_SERVERS.find((server) => server.popular);
  if (!fallback) {
    // Defensive: if no popular flag survives a refactor, fall back to the
    // first server in the list rather than throw. This keeps the connect
    // flow alive in production while still surfacing the bug in dev.
    return VPNVU_SERVERS[0];
  }
  return fallback;
}
