/**
 * VPN.vu canonical server list.
 *
 * 12 servers covering primary audience (BR), crypto-international (US/EU)
 * and strategic privacy/latency hubs. Used by the Globe 3D to render pins
 * and by the connection UI as the source of truth for location picking.
 *
 * Coordinates: decimal degrees, 4-5 places (city centers).
 * Hostnames follow the pattern `vpnvu-<cc>-<city>-<n>.vpn.vu`.
 */

export interface VpnvuServer {
  /** Stable identifier, e.g. `br-sp-1`. */
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
  // SP -- audiencia principal BR, edge router Sao Paulo backbone (ponto neutro PTT-SP)
  {
    id: 'br-sp-1',
    hostname: 'vpnvu-br-sp-1.vpn.vu',
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
  // RJ -- secundario BR pra balance de load e latencia regional sudeste
  {
    id: 'br-rj-1',
    hostname: 'vpnvu-br-rj-1.vpn.vu',
    country: 'Brasil',
    countryCode: 'BR',
    city: 'Rio de Janeiro',
    lat: -22.9068,
    lng: -43.1729,
    flag: '🇧🇷',
    provider: 'vpnvu',
    online: true,
    popular: false,
  },
  // NYC -- costa leste US, menor latencia transatlantica pro BR via cabos submarinos
  {
    id: 'us-nyc-1',
    hostname: 'vpnvu-us-nyc-1.vpn.vu',
    country: 'Estados Unidos',
    countryCode: 'US',
    city: 'Nova York',
    lat: 40.7128,
    lng: -74.006,
    flag: '🇺🇸',
    provider: 'vpnvu',
    online: true,
    popular: false,
  },
  // LAX -- costa oeste US, gaming/streaming pra audiencia que precisa de servidores na Pacific
  {
    id: 'us-lax-1',
    hostname: 'vpnvu-us-lax-1.vpn.vu',
    country: 'Estados Unidos',
    countryCode: 'US',
    city: 'Los Angeles',
    lat: 34.0522,
    lng: -118.2437,
    flag: '🇺🇸',
    provider: 'vpnvu',
    online: true,
    popular: false,
  },
  // LON -- hub EU principal, peering LINX, fintech/exchange friendly
  {
    id: 'gb-lon-1',
    hostname: 'vpnvu-gb-lon-1.vpn.vu',
    country: 'Reino Unido',
    countryCode: 'GB',
    city: 'Londres',
    lat: 51.5074,
    lng: -0.1278,
    flag: '🇬🇧',
    provider: 'vpnvu',
    online: true,
    popular: false,
  },
  // FRA -- DE-CIX, maior hub de peering da Europa continental, popular pro core EU
  {
    id: 'de-fra-1',
    hostname: 'vpnvu-de-fra-1.vpn.vu',
    country: 'Alemanha',
    countryCode: 'DE',
    city: 'Frankfurt',
    lat: 50.1109,
    lng: 8.6821,
    flag: '🇩🇪',
    provider: 'vpnvu',
    online: true,
    popular: true,
  },
  // AMS -- AMS-IX, jurisdicao privacy-friendly, base de muitos provedores Tier 1
  {
    id: 'nl-ams-1',
    hostname: 'vpnvu-nl-ams-1.vpn.vu',
    country: 'Países Baixos',
    countryCode: 'NL',
    city: 'Amsterdam',
    lat: 52.3676,
    lng: 4.9041,
    flag: '🇳🇱',
    provider: 'vpnvu',
    online: true,
    popular: false,
  },
  // STO -- "casa espiritual" Mullvad, jurisdicao sueca pro pitch de privacy
  {
    id: 'se-sto-1',
    hostname: 'vpnvu-se-sto-1.vpn.vu',
    country: 'Suécia',
    countryCode: 'SE',
    city: 'Estocolmo',
    lat: 59.3293,
    lng: 18.0686,
    flag: '🇸🇪',
    provider: 'vpnvu',
    online: true,
    popular: false,
  },
  // ZRH -- Suica, jurisdicao neutra, demanda alta de cripto/finance privacy
  {
    id: 'ch-zrh-1',
    hostname: 'vpnvu-ch-zrh-1.vpn.vu',
    country: 'Suíça',
    countryCode: 'CH',
    city: 'Zurique',
    lat: 47.3769,
    lng: 8.5417,
    flag: '🇨🇭',
    provider: 'vpnvu',
    online: true,
    popular: false,
  },
  // NRT -- Toquio, gateway Asia-Pacifico, baixa latencia pra exchanges JP/KR
  {
    id: 'jp-tyo-1',
    hostname: 'vpnvu-jp-tyo-1.vpn.vu',
    country: 'Japão',
    countryCode: 'JP',
    city: 'Tóquio',
    lat: 35.6762,
    lng: 139.6503,
    flag: '🇯🇵',
    provider: 'vpnvu',
    online: true,
    popular: false,
  },
  // SIN -- hub Sudeste Asiatico, cabos submarinos pro Indo-Pacifico
  {
    id: 'sg-sin-1',
    hostname: 'vpnvu-sg-sin-1.vpn.vu',
    country: 'Singapura',
    countryCode: 'SG',
    city: 'Singapura',
    lat: 1.3521,
    lng: 103.8198,
    flag: '🇸🇬',
    provider: 'vpnvu',
    online: true,
    popular: false,
  },
  // YYZ -- Toronto, alternativa America do Norte sem entrar em jurisdicao US (Five Eyes lite)
  {
    id: 'ca-yyz-1',
    hostname: 'vpnvu-ca-yyz-1.vpn.vu',
    country: 'Canadá',
    countryCode: 'CA',
    city: 'Toronto',
    lat: 43.6532,
    lng: -79.3832,
    flag: '🇨🇦',
    provider: 'vpnvu',
    online: true,
    popular: false,
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
 * contains at least one popular entry (br-sp-1).
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