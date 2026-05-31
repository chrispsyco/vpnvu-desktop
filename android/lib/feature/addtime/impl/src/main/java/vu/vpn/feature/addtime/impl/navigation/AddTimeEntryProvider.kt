package vu.vpn.feature.addtime.impl.navigation

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.scene.SingleOverlaySceneStrategy
import vu.vpn.feature.addtime.api.AddTimeNavKey
import vu.vpn.feature.addtime.impl.AddTimeBottomSheet

@OptIn(ExperimentalMaterial3Api::class)
fun EntryProviderScope<NavKey2>.addTimeEntry(navigator: Navigator) {
    entry<AddTimeNavKey>(metadata = SingleOverlaySceneStrategy.overlay()) {
        AddTimeBottomSheet(navigator = navigator)
    }
}
