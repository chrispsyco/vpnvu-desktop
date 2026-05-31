package vu.vpn.feature.customlist.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.CustomListName
import vu.vpn.lib.model.communication.CustomListActionResultData

@Parcelize
data class EditCustomListNameNavKey(
    val customListId: CustomListId,
    val initialName: CustomListName,
) : NavKey2

@Parcelize
data class EditCustomListNameNavResult(val value: CustomListActionResultData.Success.Renamed) :
    NavResult
