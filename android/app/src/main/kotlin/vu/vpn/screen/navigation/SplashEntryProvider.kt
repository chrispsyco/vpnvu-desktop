package vu.vpn.screen.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.screen.splash.Splash

fun EntryProviderScope<NavKey2>.splashEntry(navigator: Navigator) {
    entry<SplashNavKey> { Splash(navigator = navigator) }
}
