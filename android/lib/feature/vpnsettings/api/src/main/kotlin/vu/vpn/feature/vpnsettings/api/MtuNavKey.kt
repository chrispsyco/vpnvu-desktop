package vu.vpn.feature.vpnsettings.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.Mtu

@Parcelize data class MtuNavKey(val initialMtu: Mtu? = null) : NavKey2

@Parcelize data class MtuNavResult(val complete: Boolean) : NavResult
