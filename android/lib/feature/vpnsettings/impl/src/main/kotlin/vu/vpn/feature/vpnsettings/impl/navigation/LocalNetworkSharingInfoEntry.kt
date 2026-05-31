package vu.vpn.feature.vpnsettings.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.vpnsettings.api.LocalNetworkSharingInfoNavKey
import vu.vpn.feature.vpnsettings.impl.info.LocalNetworkSharingInfo

internal fun EntryProviderScope<NavKey2>.localNetworkSharingInfoEntry(navigator: Navigator) {
    entry<LocalNetworkSharingInfoNavKey>(metadata = DialogSceneStrategy.dialog()) {
        LocalNetworkSharingInfo(navigator = navigator)
    }
}
