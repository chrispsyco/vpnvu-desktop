package vu.vpn.feature.serveripoverride.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult

@Parcelize data class ImportOverridesNavKey(val overridesActive: Boolean) : NavKey2

@Parcelize data object ImportOverrideByFileNavResult : NavResult
