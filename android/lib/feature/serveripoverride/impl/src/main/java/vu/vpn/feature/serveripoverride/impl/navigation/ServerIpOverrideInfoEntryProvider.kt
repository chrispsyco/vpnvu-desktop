package vu.vpn.feature.serveripoverride.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.serveripoverride.api.ServerIpOverrideInfoNavKey
import vu.vpn.feature.serveripoverride.impl.info.ServerIpOverridesInfo

fun EntryProviderScope<NavKey2>.serverIpOverrideInfoEntry(navigator: Navigator) {
    entry<ServerIpOverrideInfoNavKey>(metadata = DialogSceneStrategy.dialog()) {
        ServerIpOverridesInfo(navigator = navigator)
    }
}
