package vu.vpn.feature.serveripoverride.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.scene.SingleOverlaySceneStrategy
import vu.vpn.feature.serveripoverride.api.ImportOverridesNavKey
import vu.vpn.feature.serveripoverride.impl.ImportOverridesBottomSheet

internal fun EntryProviderScope<NavKey2>.importOverridesEntry(navigator: Navigator) {
    entry<ImportOverridesNavKey>(metadata = SingleOverlaySceneStrategy.overlay()) {
        ImportOverridesBottomSheet(navigator = navigator, overridesActive = it.overridesActive)
    }
}
