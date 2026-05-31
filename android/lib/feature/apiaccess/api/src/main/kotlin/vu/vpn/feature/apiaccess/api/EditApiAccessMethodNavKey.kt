package vu.vpn.feature.apiaccess.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.ApiAccessMethodId

@Parcelize
data class EditApiAccessMethodNavKey(val accessMethodId: ApiAccessMethodId? = null) : NavKey2

@Parcelize data class EditApiAccessMethodNavResult(val success: Boolean) : NavResult
