package vu.vpn.feature.location.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.location.api.SearchLocationNavKey
import vu.vpn.feature.location.impl.search.SearchLocation

internal fun EntryProviderScope<NavKey2>.searchLocationEntry(navigator: Navigator) {
    entry<SearchLocationNavKey> { navKey ->
        SearchLocation(relayListType = navKey.relayListType, navigator = navigator)
    }
}
