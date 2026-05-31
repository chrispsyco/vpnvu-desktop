package vu.vpn.feature.login.impl.devicelist.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.login.api.DeviceListNavKey
import vu.vpn.feature.login.impl.devicelist.DeviceList

fun EntryProviderScope<NavKey2>.deviceListEntry(navigator: Navigator) {
    entry<DeviceListNavKey> { navKey ->
        DeviceList(accountNumber = navKey.accountNumber, navigator = navigator)
    }
}
