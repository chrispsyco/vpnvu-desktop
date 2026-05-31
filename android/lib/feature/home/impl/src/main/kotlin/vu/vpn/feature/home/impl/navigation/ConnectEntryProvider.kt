package vu.vpn.feature.home.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.ui.LocalNavAnimatedContentScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.homeTransition
import vu.vpn.feature.home.api.ConnectNavKey
import vu.vpn.feature.home.impl.connect.Connect
import vu.vpn.feature.login.api.LoginNavKey

fun EntryProviderScope<NavKey2>.homeEntry(navigator: Navigator) {
    entry<ConnectNavKey>(
        metadata =
            homeTransition {
                // Fade in if we came from the login screen
                navigator.previousBackStack.last() is LoginNavKey
            }
    ) {
        Connect(
            navigator = navigator,
            animatedVisibilityScope = LocalNavAnimatedContentScope.current,
        )
    }

    android16UpgradeInfoEntry(navigator)
    deviceRevokedEntry(navigator)
    deviceNameInfoEntry(navigator)
    outOfTimeEntry(navigator)
    welcomeEntry(navigator)
}
