package vu.vpn.lib.model

import arrow.optics.optics

@optics
data class RelaySettings(val relayConstraints: RelayConstraints) {
    companion object
}
