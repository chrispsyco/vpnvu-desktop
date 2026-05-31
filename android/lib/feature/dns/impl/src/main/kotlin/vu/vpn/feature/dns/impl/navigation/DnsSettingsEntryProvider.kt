package vu.vpn.feature.dns.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.ui.LocalNavAnimatedContentScope
import vu.vpn.common.compose.LocalSharedTransitionScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.dns.api.DnsSettingsNavKey
import vu.vpn.feature.dns.impl.DnsSettings

fun EntryProviderScope<NavKey2>.dnsSettingsEntry(navigator: Navigator) {
    entry<DnsSettingsNavKey>(
        metadata = ListDetailSceneStrategy.detailPane() + slideInHorizontalTransition()
    ) { navKey ->
        LocalSharedTransitionScope.current?.DnsSettings(
            navigator = navigator,
            navArgs = navKey,
            animatedVisibilityScope = LocalNavAnimatedContentScope.current,
        )
    }
    customDnsEntry(navigator)
    malwareInfoEntry(navigator)
}
