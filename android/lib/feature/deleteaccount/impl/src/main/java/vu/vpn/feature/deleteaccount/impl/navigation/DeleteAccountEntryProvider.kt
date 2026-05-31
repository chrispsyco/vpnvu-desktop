package vu.vpn.feature.deleteaccount.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.deleteaccount.api.DeleteAccountNavKey
import vu.vpn.feature.deleteaccount.impl.DeleteAccount

fun EntryProviderScope<NavKey2>.deleteAccountEntry(navigator: Navigator) {
    entry<DeleteAccountNavKey>(metadata = slideInHorizontalTransition()) {
        DeleteAccount(navigator = navigator)
    }

    deleteAccountCompleteEntry(navigator)
    deleteAccountConfirmationEntry(navigator)
}
