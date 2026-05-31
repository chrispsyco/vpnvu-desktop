package vu.vpn.feature.deleteaccount.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.deleteaccount.api.DeleteAccountConfirmationNavKey
import vu.vpn.feature.deleteaccount.impl.deleteaccountconfirmation.DeleteAccountConfirmation

internal fun EntryProviderScope<NavKey2>.deleteAccountConfirmationEntry(navigator: Navigator) {
    entry<DeleteAccountConfirmationNavKey>(metadata = slideInHorizontalTransition()) {
        DeleteAccountConfirmation(navigator = navigator)
    }
}
