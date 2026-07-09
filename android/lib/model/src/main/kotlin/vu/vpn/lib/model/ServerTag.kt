package vu.vpn.lib.model

/**
 * Product tag advertised per location by the VPN.vu backend
 * (`api.vpn.vu/v1/servers` → `tags: ["STREAMING","PRIVACY"]`). Mirrors the
 * desktop `ServerTags` badges: STREAMING marks residential relays that unblock
 * streaming; PRIVACY marks the privacy-hardened fleet. Unknown/extra tags from
 * the feed are ignored (see [fromApi]).
 */
enum class ServerTag {
    STREAMING,
    PRIVACY;

    companion object {
        /** Maps a raw feed string to a tag, or null if we don't render it. */
        fun fromApi(raw: String): ServerTag? =
            when (raw.trim().uppercase()) {
                "STREAMING" -> STREAMING
                "PRIVACY" -> PRIVACY
                else -> null
            }
    }
}
