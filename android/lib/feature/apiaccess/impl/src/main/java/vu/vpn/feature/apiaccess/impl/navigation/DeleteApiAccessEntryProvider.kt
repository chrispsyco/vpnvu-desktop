package vu.vpn.feature.apiaccess.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.apiaccess.api.DeleteApiAccessMethodNavKey
import vu.vpn.feature.apiaccess.impl.screen.delete.DeleteApiAccessMethodConfirmation

internal fun EntryProviderScope<NavKey2>.deleteApiAccessEntry(navigator: Navigator) {
    entry<DeleteApiAccessMethodNavKey>(metadata = DialogSceneStrategy.dialog()) { navKey ->
        DeleteApiAccessMethodConfirmation(
            apiAccessMethodId = navKey.apiAccessMethodId,
            navigator = navigator,
        )
    }
}
