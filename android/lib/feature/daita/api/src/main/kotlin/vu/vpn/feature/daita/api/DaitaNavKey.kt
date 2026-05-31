package vu.vpn.feature.daita.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2

@Parcelize data class DaitaNavKey(val isModal: Boolean = false) : NavKey2
