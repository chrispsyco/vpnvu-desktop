package vu.vpn.feature.home.impl.connect

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import vu.vpn.feature.home.impl.TunnelStatePreviewData.generateConnectedState
import vu.vpn.feature.home.impl.TunnelStatePreviewData.generateConnectingState
import vu.vpn.feature.home.impl.TunnelStatePreviewData.generateDisconnectedState
import vu.vpn.feature.home.impl.TunnelStatePreviewData.generateDisconnectingState
import vu.vpn.feature.home.impl.TunnelStatePreviewData.generateErrorState
import vu.vpn.lib.model.ActionAfterDisconnect
import vu.vpn.lib.model.TunnelState

class TunnelStatePreviewParameterProvider : PreviewParameterProvider<TunnelState> {
    override val values: Sequence<TunnelState> =
        sequenceOf(
            generateDisconnectedState(),
            generateConnectingState(featureIndicators = 0, quantumResistant = false),
            generateConnectingState(featureIndicators = 0, quantumResistant = true),
            generateConnectedState(featureIndicators = 0, quantumResistant = false),
            generateConnectedState(featureIndicators = 0, quantumResistant = true),
            generateDisconnectingState(actionAfterDisconnect = ActionAfterDisconnect.Block),
            generateDisconnectingState(actionAfterDisconnect = ActionAfterDisconnect.Nothing),
            generateDisconnectingState(actionAfterDisconnect = ActionAfterDisconnect.Reconnect),
            generateErrorState(isBlocking = true),
            generateErrorState(isBlocking = false),
        )
}
