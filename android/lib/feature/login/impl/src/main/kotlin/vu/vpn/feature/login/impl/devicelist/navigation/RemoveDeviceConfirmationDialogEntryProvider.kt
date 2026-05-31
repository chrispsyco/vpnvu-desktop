package vu.vpn.feature.login.impl.devicelist.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.login.api.RemoveDeviceNavKey
import vu.vpn.feature.login.impl.devicelist.RemoveDeviceConfirmation

fun EntryProviderScope<NavKey2>.removeDeviceConfirmationDialogEntry(navigator: Navigator) {
    entry<RemoveDeviceNavKey>(metadata = DialogSceneStrategy.dialog()) { navKey ->
        RemoveDeviceConfirmation(navigator = navigator, device = navKey.device)
    }
}
