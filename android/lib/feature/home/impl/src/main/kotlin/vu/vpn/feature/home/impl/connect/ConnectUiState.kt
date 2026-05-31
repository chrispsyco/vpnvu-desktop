package vu.vpn.feature.home.impl.connect

import vu.vpn.lib.model.GeoIpLocation
import vu.vpn.lib.model.InAppNotification
import vu.vpn.lib.model.TunnelState

data class ConnectUiState(
    val location: GeoIpLocation?,
    val selectedRelayItemTitle: String?,
    val tunnelState: TunnelState,
    val inAppNotification: InAppNotification?,
    val deviceName: String?,
    val daysLeftUntilExpiry: Long?,
    val isPlayBuild: Boolean,
) {

    val showLoading =
        tunnelState is TunnelState.Connecting || tunnelState is TunnelState.Disconnecting

    companion object {
        val INITIAL =
            ConnectUiState(
                location = null,
                selectedRelayItemTitle = null,
                tunnelState = TunnelState.Disconnected(),
                inAppNotification = null,
                deviceName = null,
                daysLeftUntilExpiry = null,
                isPlayBuild = false,
            )
    }
}
