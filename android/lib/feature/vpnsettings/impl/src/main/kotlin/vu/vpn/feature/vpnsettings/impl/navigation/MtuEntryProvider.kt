package vu.vpn.feature.vpnsettings.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.vpnsettings.api.MtuNavKey
import vu.vpn.feature.vpnsettings.impl.mtu.Mtu

internal fun EntryProviderScope<NavKey2>.mtuEntry(navigator: Navigator) {
    entry<MtuNavKey>(metadata = DialogSceneStrategy.dialog()) { navArgs ->
        Mtu(navArgs = navArgs, navigator = navigator)
    }
}
