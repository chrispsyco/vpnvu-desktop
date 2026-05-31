package vu.vpn.feature.splittunneling.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.splittunneling.api.SearchSplitTunnelingNavKey
import vu.vpn.feature.splittunneling.impl.search.SearchSplitTunnelingScreen

fun EntryProviderScope<NavKey2>.searchSplitTunnelingEntry(navigator: Navigator) {
    entry<SearchSplitTunnelingNavKey>(
        metadata = ListDetailSceneStrategy.detailPane() + slideInHorizontalTransition()
    ) { _ ->
        SearchSplitTunnelingScreen(navigator = navigator)
    }
}
