package vu.vpn.feature.daita.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.ui.LocalNavAnimatedContentScope
import vu.vpn.common.compose.LocalSharedTransitionScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.daita.api.DaitaNavKey
import vu.vpn.feature.daita.impl.Daita

fun EntryProviderScope<NavKey2>.daitaEntry(navigator: Navigator) {
    entry<DaitaNavKey>(
        metadata = ListDetailSceneStrategy.detailPane() + slideInHorizontalTransition()
    ) { navKey ->
        LocalSharedTransitionScope.current?.Daita(
            navigator = navigator,
            isModal = navKey.isModal,
            animatedVisibilityScope = LocalNavAnimatedContentScope.current,
        )
    }

    daitaDirectOnlyConfirmationEntry(navigator)
    daitaDirectOnlyInfoEntry(navigator)
}
