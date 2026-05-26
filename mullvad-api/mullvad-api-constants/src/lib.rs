use std::net::{IpAddr, Ipv4Addr};

pub mod env {
    pub const API_HOST_VAR: &str = "MULLVAD_API_HOST";
    pub const API_ADDR_VAR: &str = "MULLVAD_API_ADDR";
    pub const API_FORCE_DIRECT_VAR: &str = "MULLVAD_API_FORCE_DIRECT";
    pub const DISABLE_TLS_VAR: &str = "MULLVAD_API_DISABLE_TLS";
}

// PSYCO: point the daemon at our backend by default. Setting MULLVAD_API_HOST
// at runtime still overrides this, so devs can test against staging or a
// local mock. The hostname is what matters — API_IP_DEFAULT is just a seed
// for the first request before api_address_updater does DNS resolution and
// caches the live IP (see logs: "Fetched new API address X.X.X.X:443").
//
// Also picked up by mullvad-update (auto-update). Once api.vpn.vu has a
// /app/releases/ endpoint that mimics Mullvad's shape, auto-update starts
// working automatically. Until then expect harmless 404s on version checks.
pub const API_HOST_DEFAULT: &str = "api.vpn.vu";

// Vercel A record for api.vpn.vu — used as the seed for the AddressCache on
// first run (before `api-ip-address.txt` has been written) and after the
// cache file has been wiped by the installer's preinst script. The seed has
// to be a real routable IP because the firewall allow-list is built from
// whatever is currently in the cache; 0.0.0.0 here means every API request
// the daemon makes while lockdown is active gets dropped before the address
// updater can refresh the cache, surfacing as "api.vpn.vu is blocked" on
// the login screen. `api_address_updater` still runs on startup and will
// overwrite this value with the live IP returned by the API itself.
pub const API_IP_DEFAULT: IpAddr = IpAddr::V4(Ipv4Addr::new(76, 76, 21, 21));
pub const API_PORT_DEFAULT: u16 = 443;
