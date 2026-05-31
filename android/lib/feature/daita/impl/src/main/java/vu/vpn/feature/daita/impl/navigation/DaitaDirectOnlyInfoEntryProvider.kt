package vu.vpn.feature.daita.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.daita.api.DaitaDirectOnlyInfoNavKey
import vu.vpn.feature.daita.impl.DaitaDirectOnlyInfo

fun EntryProviderScope<NavKey2>.daitaDirectOnlyInfoEntry(navigator: Navigator) {
    entry<DaitaDirectOnlyInfoNavKey>(metadata = DialogSceneStrategy.dialog()) {
        DaitaDirectOnlyInfo(navigator = navigator)
    }
}
