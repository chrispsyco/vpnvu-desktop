package vu.vpn.feature.splittunneling.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2

@Parcelize data class SplitTunnelingNavKey(val isModal: Boolean = false) : NavKey2
