package vu.vpn.feature.vpnsettings.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.vpnsettings.api.ConnectOnStartupInfoNavKey
import vu.vpn.feature.vpnsettings.impl.info.ConnectOnStartupInfo

internal fun EntryProviderScope<NavKey2>.connectOnStartupInfoEntry(navigator: Navigator) {
    entry<ConnectOnStartupInfoNavKey>(metadata = DialogSceneStrategy.dialog()) {
        ConnectOnStartupInfo(navigator = navigator)
    }
}
