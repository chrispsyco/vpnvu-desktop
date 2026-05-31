package vu.vpn.feature.home.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.home.api.DeviceRevokedNavKey
import vu.vpn.feature.home.impl.devicerevoked.DeviceRevoked

internal fun EntryProviderScope<NavKey2>.deviceRevokedEntry(navigator: Navigator) {
    entry<DeviceRevokedNavKey> { DeviceRevoked(navigator = navigator) }
}
