package vu.vpn.lib.model

/**
 * Round-trip latency to a single relay, or — for an aggregate location (country
 * / city) — the lowest latency among its descendant relays.
 *
 * [measured] is `true` when [millis] came from a real ICMP probe and `false`
 * when it fell back to a deterministic mock. The fallback exists because most
 * cloud hosts (the VPN.vu relay included, Oracle drops ICMP by default) never
 * answer a ping, which would otherwise leave the picker with an empty pill. The
 * UI renders both cases identically; the flag is only kept for diagnostics.
 */
data class RelayLatency(val millis: Int, val measured: Boolean)
