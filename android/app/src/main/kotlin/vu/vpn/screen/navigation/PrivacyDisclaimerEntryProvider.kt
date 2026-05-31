package vu.vpn.screen.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.screen.privacy.PrivacyDisclaimer

fun EntryProviderScope<NavKey2>.privacyDisclaimerEntry(navigator: Navigator) {
    entry<PrivacyDisclaimerNavKey> { PrivacyDisclaimer(navigator = navigator) }
}
