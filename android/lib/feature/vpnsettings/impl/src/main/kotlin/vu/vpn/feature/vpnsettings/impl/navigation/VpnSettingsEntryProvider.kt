package vu.vpn.feature.vpnsettings.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.ui.LocalNavAnimatedContentScope
import vu.vpn.common.compose.LocalSharedTransitionScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.vpnsettings.api.VpnSettingsNavKey
import vu.vpn.feature.vpnsettings.impl.VpnSettings

fun EntryProviderScope<NavKey2>.vpnSettingsEntry(navigator: Navigator) {
    entry<VpnSettingsNavKey>(
        metadata = ListDetailSceneStrategy.listPane() + slideInHorizontalTransition()
    ) { navArgs ->
        LocalSharedTransitionScope.current?.VpnSettings(
            navArgs = navArgs,
            navigator = navigator,
            animatedVisibilityScope = LocalNavAnimatedContentScope.current,
        )
    }

    connectOnStartupInfoEntry(navigator)
    deviceIpInfoEntry(navigator)
    localNetworkSharingInfoEntry(navigator)
    ipv6InfoEntry(navigator)
    mtuEntry(navigator)
    quantumResistanceInfoEntry(navigator)
}
