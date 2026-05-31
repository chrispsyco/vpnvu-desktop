package vu.vpn.feature.anticensorship.impl

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.toLc
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.ObfuscationMode

class AntiCensorshipUiStatePreviewParameterProvider :
    PreviewParameterProvider<Lc<Boolean, AntiCensorshipSettingsUiState>> {
    override val values =
        sequenceOf(
            AntiCensorshipSettingsUiState.from(
                    isModal = false,
                    selectedWireguardPort = Constraint.Any,
                    obfuscationMode = ObfuscationMode.Udp2Tcp,
                    selectedUdp2TcpObfuscationPort = Constraint.Any,
                    selectedShadowsocksObfuscationPort = Constraint.Any,
                    selectedLwoObfuscationPort = Constraint.Any,
                )
                .toLc(),
            Lc.Loading(true),
        )
}
