package vu.vpn.feature.home.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.home.api.OutOfTimeNavKey
import vu.vpn.feature.home.impl.outoftime.OutOfTime

internal fun EntryProviderScope<NavKey2>.outOfTimeEntry(navigator: Navigator) {
    entry<OutOfTimeNavKey> { OutOfTime(navigator = navigator) }
}
