package vu.vpn.feature.home.impl.outoftime

import vu.vpn.lib.model.TunnelState

data class OutOfTimeUiState(
    val tunnelState: TunnelState = TunnelState.Disconnected(),
    val deviceName: String? = null,
    val showSitePayment: Boolean = false,
    val verificationPending: Boolean = false,
) {
    init {
        require(deviceName?.isBlank() != true) { "deviceName cannot be blank or empty" }
    }
}
