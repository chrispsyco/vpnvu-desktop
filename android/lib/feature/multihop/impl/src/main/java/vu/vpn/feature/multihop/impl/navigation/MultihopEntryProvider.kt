package vu.vpn.feature.multihop.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.ui.LocalNavAnimatedContentScope
import vu.vpn.common.compose.LocalSharedTransitionScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.multihop.api.MultihopNavKey
import vu.vpn.feature.multihop.impl.Multihop

fun EntryProviderScope<NavKey2>.multihopEntry(navigator: Navigator) {
    entry<MultihopNavKey>(
        metadata = ListDetailSceneStrategy.detailPane() + slideInHorizontalTransition()
    ) { navKey ->
        LocalSharedTransitionScope.current?.Multihop(
            isModal = navKey.isModal,
            navigator = navigator,
            animatedVisibilityScope = LocalNavAnimatedContentScope.current,
        )
    }
}
