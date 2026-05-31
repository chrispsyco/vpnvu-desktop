package vu.vpn.feature.customlist.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.communication.CustomListActionResultData

@Parcelize
data class EditCustomListLocationsNavKey(val customListId: CustomListId, val newList: Boolean) :
    NavKey2

@Parcelize
data class EditCustomListLocationsNavResult(val value: CustomListActionResultData.Success.Renamed) :
    NavResult
