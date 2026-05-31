package vu.vpn.feature.managedevices.impl

import vu.vpn.lib.model.Device

data class ManageDevicesUiState(val devices: List<ManageDevicesItemUiState>)

data class ManageDevicesItemUiState(
    val device: Device,
    val isLoading: Boolean,
    val isCurrentDevice: Boolean,
)
