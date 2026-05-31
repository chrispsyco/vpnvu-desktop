package vu.vpn.feature.appicon.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.appicon.api.AppIconNavKey
import vu.vpn.feature.appicon.impl.AppIcon

fun EntryProviderScope<NavKey2>.appIconEntry(navigator: Navigator) {
    entry<AppIconNavKey>(metadata = slideInHorizontalTransition()) {
        AppIcon(navigator = navigator)
    }
}
