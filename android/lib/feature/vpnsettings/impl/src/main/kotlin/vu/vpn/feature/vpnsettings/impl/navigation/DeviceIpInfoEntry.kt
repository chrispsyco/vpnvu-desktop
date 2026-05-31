package vu.vpn.feature.vpnsettings.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.vpnsettings.api.DeviceIpInfoNavKey
import vu.vpn.feature.vpnsettings.impl.info.DeviceIpInfo

internal fun EntryProviderScope<NavKey2>.deviceIpInfoEntry(navigator: Navigator) {
    entry<DeviceIpInfoNavKey>(metadata = DialogSceneStrategy.dialog()) {
        DeviceIpInfo(navigator = navigator)
    }
}
