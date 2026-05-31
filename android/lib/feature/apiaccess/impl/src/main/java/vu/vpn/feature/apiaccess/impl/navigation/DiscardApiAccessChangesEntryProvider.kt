package vu.vpn.feature.apiaccess.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.apiaccess.api.DiscardApiAccessChangesNavKey
import vu.vpn.feature.apiaccess.impl.screen.discardchanges.DiscardApiAccessChanges

internal fun EntryProviderScope<NavKey2>.discardApiAccessChangesEntry(navigator: Navigator) {
    entry<DiscardApiAccessChangesNavKey>(metadata = DialogSceneStrategy.dialog()) {
        DiscardApiAccessChanges(navigator = navigator)
    }
}
