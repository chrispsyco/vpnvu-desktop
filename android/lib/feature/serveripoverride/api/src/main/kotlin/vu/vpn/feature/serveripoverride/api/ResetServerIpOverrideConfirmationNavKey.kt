package vu.vpn.feature.serveripoverride.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult

@Parcelize data object ResetServerIpOverrideConfirmationNavKey : NavKey2

@Parcelize
data class ResetServerIpOverrideConfirmationNavResult(val clearSuccessful: Boolean) : NavResult
