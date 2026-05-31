package vu.vpn.feature.customlist.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.GeoLocationId
import vu.vpn.lib.model.communication.CustomListActionResultData

@Parcelize data class CreateCustomListNavKey(val locationCode: GeoLocationId? = null) : NavKey2

@Parcelize
data class CreateCustomListNavResult(
    val value: CustomListActionResultData.Success.CreatedWithLocations
) : NavResult
