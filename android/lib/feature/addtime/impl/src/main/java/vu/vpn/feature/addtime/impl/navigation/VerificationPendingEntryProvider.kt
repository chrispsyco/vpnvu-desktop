package vu.vpn.feature.addtime.impl.navigation

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.addtime.api.VerificationPendingNavKey
import vu.vpn.feature.addtime.impl.verificationpending.VerificationPending

@OptIn(ExperimentalMaterial3Api::class)
fun EntryProviderScope<NavKey2>.addTimeVerificationPendingEntry(navigator: Navigator) {
    entry<VerificationPendingNavKey>(metadata = DialogSceneStrategy.dialog()) {
        VerificationPending(navigator = navigator)
    }

    addTimeEntry(navigator)
}
