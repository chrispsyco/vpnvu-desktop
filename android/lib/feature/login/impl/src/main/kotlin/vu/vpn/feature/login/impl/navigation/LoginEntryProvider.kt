package vu.vpn.feature.login.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.loginTransition
import vu.vpn.feature.home.api.ConnectNavKey
import vu.vpn.feature.home.api.OutOfTimeNavKey
import vu.vpn.feature.home.api.WelcomeNavKey
import vu.vpn.feature.login.api.DeviceListNavKey
import vu.vpn.feature.login.api.LoginNavKey
import vu.vpn.feature.login.impl.Login

fun EntryProviderScope<NavKey2>.loginEntry(navigator: Navigator) {

    entry<LoginNavKey>(
        metadata =
            loginTransition {
                // Fade out if we are navigating to one of the following
                when (navigator.backStack.dropLast(1).lastOrNull()) {
                    OutOfTimeNavKey,
                    WelcomeNavKey,
                    ConnectNavKey,
                    is DeviceListNavKey -> true
                    else -> false
                }
            }
    ) { navKey ->
        Login(navigator = navigator, accountNumber = navKey.accountNumber)
    }

    apiUnreachableEntry(navigator)
    createAccountConfirmationEntry(navigator)
}
