package vu.vpn.feature.apiaccess.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult

@Parcelize object DiscardApiAccessChangesNavKey : NavKey2

@Parcelize data object DiscardApiAccessChangesConfirmedNavResult : NavResult
