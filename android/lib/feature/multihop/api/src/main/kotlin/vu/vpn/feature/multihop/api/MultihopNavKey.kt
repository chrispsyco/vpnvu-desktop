package vu.vpn.feature.multihop.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2

@Parcelize data class MultihopNavKey(val isModal: Boolean = false) : NavKey2
