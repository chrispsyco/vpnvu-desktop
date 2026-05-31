package vu.vpn.feature.serveripoverride.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.serveripoverride.api.ResetServerIpOverrideConfirmationNavKey
import vu.vpn.feature.serveripoverride.impl.reset.ResetServerIpOverridesConfirmation

internal fun EntryProviderScope<NavKey2>.resetServerIpOverrideConfirmationEntry(
    navigator: Navigator
) {
    entry<ResetServerIpOverrideConfirmationNavKey>(metadata = DialogSceneStrategy.dialog()) {
        ResetServerIpOverridesConfirmation(navigator = navigator)
    }
}
