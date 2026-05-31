package vu.vpn.feature.login.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.login.api.ApiUnreachableNavKey
import vu.vpn.feature.login.impl.apiunreachable.ApiUnreachableInfo

internal fun EntryProviderScope<NavKey2>.apiUnreachableEntry(navigator: Navigator) {
    entry<ApiUnreachableNavKey> { navKey ->
        ApiUnreachableInfo(navigator = navigator, navArgs = navKey)
    }
}
