package vu.vpn.feature.customlist.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.customlist.api.EditCustomListNavKey
import vu.vpn.feature.customlist.impl.screen.editlist.EditCustomList

internal fun EntryProviderScope<NavKey2>.editCustomListEntry(navigator: Navigator) {
    entry<EditCustomListNavKey>(metadata = slideInHorizontalTransition()) { navKey ->
        EditCustomList(customListId = navKey.customListId, navigator = navigator)
    }
}
