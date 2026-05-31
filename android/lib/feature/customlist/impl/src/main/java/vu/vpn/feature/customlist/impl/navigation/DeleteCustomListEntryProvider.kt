package vu.vpn.feature.customlist.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.customlist.api.DeleteCustomListNavKey
import vu.vpn.feature.customlist.impl.screen.delete.DeleteCustomList

internal fun EntryProviderScope<NavKey2>.deleteCustomListEntry(navigator: Navigator) {
    entry<DeleteCustomListNavKey>(metadata = DialogSceneStrategy.dialog()) { navKey ->
        DeleteCustomList(navArgs = navKey, navigator = navigator)
    }
}
