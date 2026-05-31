package vu.vpn.feature.vpnsettings.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.vpnsettings.api.QuantumResistanceInfoNavKey
import vu.vpn.feature.vpnsettings.impl.info.QuantumResistanceInfo

internal fun EntryProviderScope<NavKey2>.quantumResistanceInfoEntry(navigator: Navigator) {
    entry<QuantumResistanceInfoNavKey>(metadata = DialogSceneStrategy.dialog()) {
        QuantumResistanceInfo(navigator = navigator)
    }
}
