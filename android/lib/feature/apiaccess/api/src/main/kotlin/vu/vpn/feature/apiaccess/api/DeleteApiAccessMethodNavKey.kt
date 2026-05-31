package vu.vpn.feature.apiaccess.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.ApiAccessMethodId

@Parcelize
data class DeleteApiAccessMethodNavKey(val apiAccessMethodId: ApiAccessMethodId) : NavKey2

@Parcelize object DeleteApiAccessMethodConfirmedNavResult : NavResult
