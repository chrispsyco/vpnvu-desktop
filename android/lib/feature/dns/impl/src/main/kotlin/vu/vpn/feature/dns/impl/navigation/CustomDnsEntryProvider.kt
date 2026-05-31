package vu.vpn.feature.dns.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.dns.api.CustomDnsNavKey
import vu.vpn.feature.dns.impl.CustomDns

internal fun EntryProviderScope<NavKey2>.customDnsEntry(navigator: Navigator) {
    entry<CustomDnsNavKey>(metadata = DialogSceneStrategy.dialog()) { navKey ->
        CustomDns(navArgs = navKey, navigator = navigator)
    }
}
