package vu.vpn.feature.appearance.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.appearance.api.AppearanceNavKey
import vu.vpn.feature.appearance.impl.Appearance

fun EntryProviderScope<NavKey2>.appearanceEntry(navigator: Navigator) {
    entry<AppearanceNavKey>(
        metadata = ListDetailSceneStrategy.detailPane() + slideInHorizontalTransition()
    ) {
        Appearance(navigator = navigator)
    }
}
