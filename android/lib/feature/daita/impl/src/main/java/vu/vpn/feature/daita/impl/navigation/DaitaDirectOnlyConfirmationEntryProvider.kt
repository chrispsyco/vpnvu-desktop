package vu.vpn.feature.daita.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.daita.api.DaitaDirectOnlyConfirmationNavKey
import vu.vpn.feature.daita.impl.DaitaDirectOnlyConfirmation

fun EntryProviderScope<NavKey2>.daitaDirectOnlyConfirmationEntry(navigator: Navigator) {
    entry<DaitaDirectOnlyConfirmationNavKey>(metadata = DialogSceneStrategy.dialog()) {
        DaitaDirectOnlyConfirmation(navigator = navigator)
    }
}
