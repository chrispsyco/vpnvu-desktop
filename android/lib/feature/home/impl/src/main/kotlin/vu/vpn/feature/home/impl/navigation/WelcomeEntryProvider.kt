package vu.vpn.feature.home.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.home.api.WelcomeNavKey
import vu.vpn.feature.home.impl.welcome.Welcome

internal fun EntryProviderScope<NavKey2>.welcomeEntry(navigator: Navigator) {
    entry<WelcomeNavKey> { Welcome(navigator = navigator) }
}
