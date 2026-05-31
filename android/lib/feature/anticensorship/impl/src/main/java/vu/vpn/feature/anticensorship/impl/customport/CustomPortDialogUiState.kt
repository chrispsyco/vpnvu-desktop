package vu.vpn.feature.anticensorship.impl.customport

import vu.vpn.lib.model.ParsePortError
import vu.vpn.lib.model.PortRange

data class CustomPortDialogUiState(
    val portInput: String,
    val portInputError: ParsePortError?,
    val allowedPortRanges: List<PortRange>,
    val recommendedPortRanges: List<PortRange>,
    val showResetToDefault: Boolean,
)
