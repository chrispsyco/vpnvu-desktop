package vu.vpn.screen.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.screen.nodaemon.NoDaemon

fun EntryProviderScope<NavKey2>.noDaemonEntry(navigator: Navigator) {
    entry<NoDaemonNavKey> { NoDaemon(navigator = navigator) }
}
