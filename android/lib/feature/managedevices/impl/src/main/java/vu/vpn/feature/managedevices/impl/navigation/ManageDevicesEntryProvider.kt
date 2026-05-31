package vu.vpn.feature.managedevices.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.managedevices.api.ManageDevicesNavKey
import vu.vpn.feature.managedevices.impl.ManageDevices

fun EntryProviderScope<NavKey2>.manageDevicesEntry(navigator: Navigator) {
    entry<ManageDevicesNavKey> { navKey ->
        ManageDevices(accountNumber = navKey.accountNumber, navigator = navigator)
    }

    manageDevicesRemoveConfirmationEntry(navigator)
}
