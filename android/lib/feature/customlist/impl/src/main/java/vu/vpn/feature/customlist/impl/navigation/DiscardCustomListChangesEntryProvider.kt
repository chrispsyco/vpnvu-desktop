package vu.vpn.feature.customlist.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.customlist.api.DiscardCustomListChangesNavKey
import vu.vpn.feature.customlist.impl.screen.discard.DiscardChanges

internal fun EntryProviderScope<NavKey2>.discardCustomListChangesEntry(navigator: Navigator) {
    entry<DiscardCustomListChangesNavKey>(metadata = DialogSceneStrategy.dialog()) {
        DiscardChanges(navigator = navigator)
    }
}
