package vu.vpn.feature.apiaccess.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.ApiAccessMethod
import vu.vpn.lib.model.ApiAccessMethodId
import vu.vpn.lib.model.ApiAccessMethodName

@Parcelize
data class SaveApiAccessMethodNavKey(
    val id: ApiAccessMethodId?,
    val name: ApiAccessMethodName,
    val customProxy: ApiAccessMethod.CustomProxy,
) : NavKey2

@Parcelize data class SaveApiAccessMethodNavResult(val success: Boolean) : NavResult
