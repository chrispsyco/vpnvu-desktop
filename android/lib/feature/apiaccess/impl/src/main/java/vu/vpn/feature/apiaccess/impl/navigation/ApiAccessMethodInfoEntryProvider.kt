package vu.vpn.feature.apiaccess.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.apiaccess.api.ApiAccessMethodInfoNavKey
import vu.vpn.feature.apiaccess.impl.screen.info.ApiAccessMethodInfo

internal fun EntryProviderScope<NavKey2>.apiAccessMethodInfoEntry(navigator: Navigator) {
    entry<ApiAccessMethodInfoNavKey>(metadata = DialogSceneStrategy.dialog()) {
        ApiAccessMethodInfo(navigator = navigator)
    }
}
