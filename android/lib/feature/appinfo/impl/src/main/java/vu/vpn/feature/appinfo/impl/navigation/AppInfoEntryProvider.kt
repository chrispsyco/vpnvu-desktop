package vu.vpn.feature.appinfo.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.appinfo.api.AppInfoNavKey
import vu.vpn.feature.appinfo.impl.AppInfo

internal fun EntryProviderScope<NavKey2>.appInfoEntry(navigator: Navigator) {
    entry<AppInfoNavKey>(
        metadata = ListDetailSceneStrategy.detailPane() + slideInHorizontalTransition()
    ) {
        AppInfo(navigator = navigator)
    }
}
