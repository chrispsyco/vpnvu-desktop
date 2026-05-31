package vu.vpn.feature.managedevices.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.Device
import vu.vpn.lib.model.DeviceId

@Parcelize data class ManageDevicesRemoveConfirmationNavKey(val device: Device) : NavKey2

@Parcelize data class ManageDevicesRemoveConfirmationNavResult(val deviceId: DeviceId) : NavResult
