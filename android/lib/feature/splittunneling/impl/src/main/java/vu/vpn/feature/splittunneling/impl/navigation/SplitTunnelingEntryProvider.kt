package vu.vpn.feature.splittunneling.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.ui.LocalNavAnimatedContentScope
import vu.vpn.common.compose.LocalSharedTransitionScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.splittunneling.api.SplitTunnelingNavKey
import vu.vpn.feature.splittunneling.impl.SplitTunneling

fun EntryProviderScope<NavKey2>.splitTunnelingEntry(navigator: Navigator) {
    entry<SplitTunnelingNavKey>(
        metadata = ListDetailSceneStrategy.detailPane() + slideInHorizontalTransition()
    ) { navArgs ->
        LocalSharedTransitionScope.current?.SplitTunneling(
            isModal = navArgs.isModal,
            navigator = navigator,
            animatedVisibilityScope = LocalNavAnimatedContentScope.current,
        )
    }
    searchSplitTunnelingEntry(navigator)
}
