package vu.vpn.lib.model

import arrow.optics.optics

@optics
data class DaitaSettings(val enabled: Boolean, val directOnly: Boolean) {
    companion object
}
