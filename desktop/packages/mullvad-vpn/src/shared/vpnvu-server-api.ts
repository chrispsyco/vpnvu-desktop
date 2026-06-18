// -----------------------------------------------------------------------------
// VPN.vu · shape of one entry from the public `GET https://api.vpn.vu/v1/servers`
// feed. Lives in `shared/` because it crosses the IPC boundary: the MAIN process
// fetches the feed (the renderer has no network — Mullvad request-blocker posture)
// and ships these raw entries to the renderer over IPC, where `vpnvu-servers.ts`
// maps them into the richer `VpnvuServer` used by the globe + location picker.
//
// Keep this in sync with the backend serializer in
// `vpnvu-backend/src/routes/.../servers` (one city per country in the v1 feed).
// -----------------------------------------------------------------------------

export interface VpnvuServerApiEntry {
  id: string;
  country: string;
  countryCode: string;
  city: string;
  cityCode: string;
  lat: number;
  lng: number;
  /** Product tags (e.g. `STREAMING`, `PRIVACY`). Optional during the backend
   *  transition — absent/empty until the `tags` column is served. */
  tags?: string[];
}
