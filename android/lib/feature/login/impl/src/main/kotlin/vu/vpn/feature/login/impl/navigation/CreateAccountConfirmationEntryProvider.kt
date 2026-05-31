package vu.vpn.feature.login.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.login.api.CreateAccountConfirmationNavKey
import vu.vpn.feature.login.impl.CreateAccountConfirmation

internal fun EntryProviderScope<NavKey2>.createAccountConfirmationEntry(navigator: Navigator) {
    entry<CreateAccountConfirmationNavKey>(metadata = DialogSceneStrategy.dialog()) {
        CreateAccountConfirmation(navigator = navigator)
    }
}
