package vu.vpn.feature.location.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.topLevelTransition
import vu.vpn.feature.location.api.SelectLocationNavKey
import vu.vpn.feature.location.impl.SelectLocation

fun EntryProviderScope<NavKey2>.selectLocationEntry(navigator: Navigator) {
    entry<SelectLocationNavKey>(metadata = topLevelTransition()) { navKey ->
        SelectLocation(navigator = navigator, initialHop = navKey.initialHop)
    }

    locationBottomSheetEntry(navigator)
    searchLocationEntry(navigator)
}
