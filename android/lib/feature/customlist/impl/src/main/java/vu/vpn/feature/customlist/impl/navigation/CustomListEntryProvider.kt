package vu.vpn.feature.customlist.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.customlist.api.CustomListNavKey
import vu.vpn.feature.customlist.impl.screen.lists.CustomLists

fun EntryProviderScope<NavKey2>.customListEntry(navigator: Navigator) {
    entry<CustomListNavKey>(metadata = slideInHorizontalTransition()) {
        CustomLists(navigator = navigator)
    }

    createCustomListEntry(navigator)
    deleteCustomListEntry(navigator)
    editCustomListEntry(navigator)
    editCustomListLocationsEntry(navigator)
    editCustomListNameEntry(navigator)
    discardCustomListChangesEntry(navigator)
}
