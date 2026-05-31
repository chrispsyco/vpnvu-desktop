package vu.vpn.feature.location.impl.search

import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.ui.component.relaylist.RelayListItem
import vu.vpn.lib.usecase.FilterChip

data class SearchLocationUiState(
    val searchTerm: String,
    val relayListType: RelayListType,
    val filterChips: List<FilterChip>,
    val relayListItems: List<RelayListItem>,
    val customLists: List<RelayItem.CustomList>,
)
