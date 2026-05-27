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

// Vercel A record for api.vpn.vu — used as the seed address for the very
// first API call before api_address_updater finishes resolving DNS and
// caches the live IP. Using 0.0.0.0 here is a footgun: the daemon's
// "Direct" access method tries to connect to that address verbatim, gets
// WSAEADDRNOTAVAIL, and then falls back to Encrypted-DNS-Proxy / Domain-
// Fronting (both hardcoded to api.mullvad.net), which then fails with a
// TLS cert mismatch ("certificate not valid for name api.vpn.vu"). Pinning
// 76.76.21.21 keeps Direct working from the first request; api_address_-
// updater still kicks in afterwards if Vercel's anycast IP rotates.
pub const API_IP_DEFAULT: IpAddr = IpAddr::V4(Ipv4Addr::new(76, 76, 21, 21));
pub const API_PORT_DEFAULT: u16 = 443;
