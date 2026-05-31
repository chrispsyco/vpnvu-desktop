package vu.vpn.feature.location.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.scene.SingleOverlaySceneStrategy
import vu.vpn.feature.location.api.LocationBottomSheetNavKey
import vu.vpn.feature.location.impl.bottomsheet.LocationBottomSheets

internal fun EntryProviderScope<NavKey2>.locationBottomSheetEntry(navigator: Navigator) {
    entry<LocationBottomSheetNavKey>(metadata = SingleOverlaySceneStrategy.overlay()) { navKey ->
        LocationBottomSheets(navigator = navigator, locationBottomSheetState = navKey.state)
    }
}
