package vu.vpn.feature.customlist.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.customlist.api.EditCustomListNameNavKey
import vu.vpn.feature.customlist.impl.screen.editname.EditCustomListName

internal fun EntryProviderScope<NavKey2>.editCustomListNameEntry(navigator: Navigator) {
    entry<EditCustomListNameNavKey>(metadata = DialogSceneStrategy.dialog()) { navKey ->
        EditCustomListName(navArgs = navKey, navigator = navigator)
    }
}
