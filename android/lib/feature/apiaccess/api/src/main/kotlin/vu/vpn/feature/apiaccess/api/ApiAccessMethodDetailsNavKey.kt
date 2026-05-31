package vu.vpn.feature.apiaccess.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.lib.model.ApiAccessMethodId

@Parcelize data class ApiAccessMethodDetailsNavKey(val accessMethodId: ApiAccessMethodId) : NavKey2
