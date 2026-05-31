package vu.vpn.feature.redeemvoucher.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult

@Parcelize object RedeemVoucherNavKey : NavKey2

@Parcelize data class RedeemVoucherNavResult(val isTimeAdded: Boolean) : NavResult
