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

// Reserved IP — forces the daemon to skip the hardcoded seed and go straight
// to DNS resolution via api_address_updater on the first API call. Avoids
// pinning a stale Vercel/Cloudflare IP into the binary.
pub const API_IP_DEFAULT: IpAddr = IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0));
pub const API_PORT_DEFAULT: u16 = 443;
