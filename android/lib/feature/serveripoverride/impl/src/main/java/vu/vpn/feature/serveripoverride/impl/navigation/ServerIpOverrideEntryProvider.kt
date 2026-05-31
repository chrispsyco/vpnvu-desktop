package vu.vpn.feature.serveripoverride.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.ui.LocalNavAnimatedContentScope
import vu.vpn.common.compose.LocalSharedTransitionScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.serveripoverride.api.ServerIpOverrideNavKey
import vu.vpn.feature.serveripoverride.impl.ServerIpOverrides

fun EntryProviderScope<NavKey2>.serverIpOverrideEntry(navigator: Navigator) {
    entry<ServerIpOverrideNavKey>(
        metadata = ListDetailSceneStrategy.detailPane() + slideInHorizontalTransition()
    ) { navKey ->
        LocalSharedTransitionScope.current?.ServerIpOverrides(
            navArgs = navKey,
            navigator = navigator,
            animatedVisibilityScope = LocalNavAnimatedContentScope.current,
        )
    }

    resetServerIpOverrideConfirmationEntry(navigator)
    importOverrideByTextScreenEntry(navigator)
    importOverridesEntry(navigator)
    serverIpOverrideInfoEntry(navigator)
}
