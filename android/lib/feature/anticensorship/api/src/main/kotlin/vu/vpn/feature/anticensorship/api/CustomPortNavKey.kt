package vu.vpn.feature.anticensorship.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.Port
import vu.vpn.lib.model.PortRange
import vu.vpn.lib.model.PortType

@Parcelize
data class CustomPortNavKey(
    val portType: PortType,
    val allowedPortRanges: List<PortRange>,
    val recommendedPortRanges: List<PortRange>,
    val customPort: Port?,
) : NavKey2

@Parcelize data class CustomPortNavResult(val port: Port?) : NavResult
