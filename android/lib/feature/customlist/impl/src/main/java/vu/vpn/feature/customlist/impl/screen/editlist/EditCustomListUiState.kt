package vu.vpn.feature.customlist.impl.screen.editlist

import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.CustomListName
import vu.vpn.lib.model.GeoLocationId

sealed interface EditCustomListUiState {
    data object Loading : EditCustomListUiState

    data object NotFound : EditCustomListUiState

    data class Content(
        val id: CustomListId,
        val name: CustomListName,
        val locations: List<GeoLocationId>,
    ) : EditCustomListUiState
}
