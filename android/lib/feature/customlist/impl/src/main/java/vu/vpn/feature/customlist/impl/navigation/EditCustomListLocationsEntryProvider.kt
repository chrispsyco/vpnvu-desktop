package vu.vpn.feature.customlist.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.customlist.api.EditCustomListLocationsNavKey
import vu.vpn.feature.customlist.impl.screen.editlocations.CustomListLocations

internal fun EntryProviderScope<NavKey2>.editCustomListLocationsEntry(navigator: Navigator) {
    entry<EditCustomListLocationsNavKey> { navKey ->
        CustomListLocations(navArgs = navKey, navigator = navigator)
    }
}
