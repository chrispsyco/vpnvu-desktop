package vu.vpn.feature.home.impl.welcome

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import vu.vpn.feature.home.impl.TunnelStatePreviewData
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.toLc
import vu.vpn.lib.model.AccountNumber

class WelcomeScreenUiStatePreviewParameterProvider :
    PreviewParameterProvider<Lc<Unit, WelcomeUiState>> {
    override val values =
        sequenceOf(
            Lc.Loading(Unit),
            WelcomeUiState(
                    tunnelState = TunnelStatePreviewData.generateDisconnectedState(),
                    accountNumber = AccountNumber("4444555566667777"),
                    deviceName = "Happy Mole",
                    showSitePayment = false,
                    verificationPending = true,
                )
                .toLc(),
            WelcomeUiState(
                    tunnelState =
                        TunnelStatePreviewData.generateConnectedState(featureIndicators = 1, false),
                    accountNumber = AccountNumber("4444555566667777"),
                    deviceName = "Happy Mole",
                    showSitePayment = true,
                    verificationPending = false,
                )
                .toLc(),
        )
}
