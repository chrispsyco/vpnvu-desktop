package vu.vpn.feature.anticensorship.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.lib.model.PortType

@Parcelize data class SelectPortNavKey(val portType: PortType) : NavKey2
