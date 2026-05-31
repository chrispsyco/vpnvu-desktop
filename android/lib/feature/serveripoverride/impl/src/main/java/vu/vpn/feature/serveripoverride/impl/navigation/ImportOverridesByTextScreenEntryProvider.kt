package vu.vpn.feature.serveripoverride.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.serveripoverride.api.ImportOverrideByTextNavKey
import vu.vpn.feature.serveripoverride.impl.importbytext.ImportOverridesByText

internal fun EntryProviderScope<NavKey2>.importOverrideByTextScreenEntry(navigator: Navigator) {
    entry<ImportOverrideByTextNavKey> { ImportOverridesByText(navigator = navigator) }
}
