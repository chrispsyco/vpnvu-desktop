package vu.vpn.feature.customlist.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.communication.CustomListActionResultData

@Parcelize data class EditCustomListNavKey(val customListId: CustomListId) : NavKey2

@Parcelize data class EditCustomListNavResult(val value: CustomListActionResultData) : NavResult
