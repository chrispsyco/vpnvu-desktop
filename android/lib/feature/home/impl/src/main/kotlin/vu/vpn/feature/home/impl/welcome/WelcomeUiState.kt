package vu.vpn.feature.home.impl.welcome

import vu.vpn.lib.model.AccountNumber
import vu.vpn.lib.model.TunnelState

data class WelcomeUiState(
    val tunnelState: TunnelState,
    val accountNumber: AccountNumber?,
    val deviceName: String?,
    val showSitePayment: Boolean,
    val verificationPending: Boolean,
)
