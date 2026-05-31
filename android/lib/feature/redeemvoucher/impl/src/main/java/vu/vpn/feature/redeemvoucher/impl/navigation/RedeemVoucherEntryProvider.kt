package vu.vpn.feature.redeemvoucher.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.redeemvoucher.api.RedeemVoucherNavKey
import vu.vpn.feature.redeemvoucher.impl.RedeemVoucher

fun EntryProviderScope<NavKey2>.redeemVoucherEntry(navigator: Navigator) {
    entry<RedeemVoucherNavKey>(metadata = DialogSceneStrategy.dialog()) {
        RedeemVoucher(navigator = navigator)
    }
}
