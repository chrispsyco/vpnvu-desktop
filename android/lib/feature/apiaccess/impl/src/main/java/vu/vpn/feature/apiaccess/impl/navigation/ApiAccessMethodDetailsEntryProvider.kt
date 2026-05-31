package vu.vpn.feature.apiaccess.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.apiaccess.api.ApiAccessMethodDetailsNavKey
import vu.vpn.feature.apiaccess.impl.screen.detail.ApiAccessMethodDetails

internal fun EntryProviderScope<NavKey2>.apiAccessMethodDetailsEntry(navigator: Navigator) {
    entry<ApiAccessMethodDetailsNavKey>(metadata = slideInHorizontalTransition()) { navKey ->
        ApiAccessMethodDetails(apiAccessMethodId = navKey.accessMethodId, navigator = navigator)
    }
}
