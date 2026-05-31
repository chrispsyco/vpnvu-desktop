package vu.vpn.lib.common.util

import vu.vpn.lib.model.Port
import vu.vpn.lib.model.PortRange

fun Port.inAnyOf(portRanges: List<PortRange>): Boolean = portRanges.any { portRange ->
    this in portRange
}

fun List<PortRange>.asString() = joinToString(", ", transform = PortRange::toFormattedString)
