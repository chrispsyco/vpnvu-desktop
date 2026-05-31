package vu.vpn.feature.vpnsettings.impl

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.toLc
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.Mtu
import vu.vpn.lib.model.ObfuscationMode
import vu.vpn.lib.model.QuantumResistantState

private const val MTU = 1337

class VpnSettingsUiStatePreviewParameterProvider :
    PreviewParameterProvider<Lc<Boolean, VpnSettingsUiState>> {
    override val values =
        sequenceOf(
            Lc.Loading(true),
            VpnSettingsUiState.from(
                    mtu = Mtu(MTU),
                    isLocalNetworkSharingEnabled = true,
                    quantumResistant = QuantumResistantState.On,
                    systemVpnSettingsAvailable = true,
                    autoStartAndConnectOnBoot = true,
                    isIpv6Enabled = true,
                    obfuscationMode = ObfuscationMode.Udp2Tcp,
                    deviceIpVersion = Constraint.Any,
                    isModal = false,
                )
                .toLc(),
        )
}
