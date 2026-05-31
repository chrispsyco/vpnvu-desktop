package vu.vpn.feature.apiaccess.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.apiaccess.api.SaveApiAccessMethodNavKey
import vu.vpn.feature.apiaccess.impl.screen.save.SaveApiAccessMethod

internal fun EntryProviderScope<NavKey2>.saveApiAccessMethodEntry(navigator: Navigator) {
    entry<SaveApiAccessMethodNavKey>(metadata = DialogSceneStrategy.dialog()) { navKey ->
        SaveApiAccessMethod(navArgs = navKey, navigator = navigator)
    }
}
