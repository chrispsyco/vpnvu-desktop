package vu.vpn.feature.serveripoverride.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2

@Parcelize data class ServerIpOverrideNavKey(val isModal: Boolean = false) : NavKey2
