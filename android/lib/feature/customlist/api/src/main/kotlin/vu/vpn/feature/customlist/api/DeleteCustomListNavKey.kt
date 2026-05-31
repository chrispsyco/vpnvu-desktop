package vu.vpn.feature.customlist.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.CustomListName
import vu.vpn.lib.model.communication.CustomListActionResultData

@Parcelize
data class DeleteCustomListNavKey(val customListId: CustomListId, val name: CustomListName) :
    NavKey2

@Parcelize
data class DeleteCustomListNavResult(val value: CustomListActionResultData.Success.Deleted) :
    NavResult
