package vu.vpn.feature.deleteaccount.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.deleteaccount.api.DeleteAccountCompleteNavKey
import vu.vpn.feature.deleteaccount.impl.deleteaccountcomplete.DeleteAccountComplete

internal fun EntryProviderScope<NavKey2>.deleteAccountCompleteEntry(navigator: Navigator) {
    entry<DeleteAccountCompleteNavKey>(metadata = slideInHorizontalTransition()) {
        DeleteAccountComplete(navigator = navigator)
    }
}
