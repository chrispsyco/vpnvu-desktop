package vu.vpn.feature.anticensorship.impl.selectport

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import vu.vpn.feature.anticensorship.impl.UDP2TCP_PRESET_PORTS
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.toLc
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.Port
import vu.vpn.lib.model.PortType

class SelectPortUiStatePreviewParameterProvider :
    PreviewParameterProvider<Lc<Unit, SelectPortUiState>> {
    override val values: Sequence<Lc<Unit, SelectPortUiState>> =
        sequenceOf(
            SelectPortUiState(
                    portType = PortType.Udp2Tcp,
                    presetPorts = UDP2TCP_PRESET_PORTS,
                    customPortEnabled = false,
                    title = "Select port",
                )
                .toLc(),
            SelectPortUiState(
                    portType = PortType.Lwo,
                    port = Constraint.Only(Port(1)),
                    presetPorts = emptyList(),
                    customPortEnabled = true,
                    title = "Select port",
                )
                .toLc(),
        )
}
