package vu.vpn.feature.home.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.home.api.DeviceNameInfoNavKey
import vu.vpn.feature.home.impl.welcome.DeviceNameInfo

internal fun EntryProviderScope<NavKey2>.deviceNameInfoEntry(navigator: Navigator) {
    entry<DeviceNameInfoNavKey>(metadata = DialogSceneStrategy.dialog()) {
        DeviceNameInfo(navigator = navigator)
    }
}
