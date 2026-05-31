package vu.vpn.feature.apiaccess.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.apiaccess.api.ApiAccessNavKey
import vu.vpn.feature.apiaccess.impl.screen.list.ApiAccessList

fun EntryProviderScope<NavKey2>.apiAccessEntry(navigator: Navigator) {
    entry<ApiAccessNavKey>(
        metadata = ListDetailSceneStrategy.detailPane() + slideInHorizontalTransition()
    ) {
        ApiAccessList(navigator = navigator)
    }

    apiAccessMethodDetailsEntry(navigator)
    apiAccessMethodInfoEntry(navigator)
    editApiAccessMethodEntry(navigator)
    deleteApiAccessEntry(navigator)
    discardApiAccessChangesEntry(navigator)
    encryptedDnsProxyAccessEntry(navigator)
    saveApiAccessMethodEntry(navigator)
}
