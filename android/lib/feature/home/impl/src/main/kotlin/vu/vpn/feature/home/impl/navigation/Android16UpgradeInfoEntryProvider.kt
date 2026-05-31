package vu.vpn.feature.home.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.home.api.Android16UpgradeInfoNavKey
import vu.vpn.feature.home.impl.connect.Android16UpgradeWarningInfo

internal fun EntryProviderScope<NavKey2>.android16UpgradeInfoEntry(navigator: Navigator) {
    entry<Android16UpgradeInfoNavKey>(metadata = DialogSceneStrategy.dialog()) {
        Android16UpgradeWarningInfo(navigator = navigator)
    }
}
