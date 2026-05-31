package vu.vpn.feature.managedevices.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.managedevices.api.ManageDevicesRemoveConfirmationNavKey
import vu.vpn.feature.managedevices.impl.confirmation.ManageDevicesRemoveConfirmation

internal fun EntryProviderScope<NavKey2>.manageDevicesRemoveConfirmationEntry(
    navigator: Navigator
) {
    entry<ManageDevicesRemoveConfirmationNavKey>(metadata = DialogSceneStrategy.dialog()) { navKey
        ->
        ManageDevicesRemoveConfirmation(navigator = navigator, device = navKey.device)
    }
}
