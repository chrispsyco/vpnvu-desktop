package vu.vpn.feature.anticensorship.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.anticensorship.api.SelectPortNavKey
import vu.vpn.feature.anticensorship.impl.selectport.SelectPort

internal fun EntryProviderScope<NavKey2>.selectPortEntry(navigator: Navigator) {
    entry<SelectPortNavKey>(metadata = slideInHorizontalTransition()) { navArgs ->
        SelectPort(navArgs = navArgs, navigator = navigator)
    }
}
