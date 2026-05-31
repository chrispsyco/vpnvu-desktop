package vu.vpn.feature.autoconnect.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.autoconnect.api.AutoConnectNavKey
import vu.vpn.feature.autoconnect.impl.AutoConnectAndLockdownMode

fun EntryProviderScope<NavKey2>.autoConnectEntry(navigator: Navigator) {
    entry<AutoConnectNavKey>(
        metadata = ListDetailSceneStrategy.detailPane() + slideInHorizontalTransition()
    ) {
        AutoConnectAndLockdownMode(navigator = navigator)
    }
}
