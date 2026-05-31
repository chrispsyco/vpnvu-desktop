package vu.vpn.feature.customlist.impl.screen.lists

import vu.vpn.lib.model.CustomList

interface CustomListsUiState {
    object Loading : CustomListsUiState

    data class Content(val customLists: List<CustomList> = emptyList()) : CustomListsUiState
}
