package vu.vpn.feature.location.impl.list

import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.ui.component.relaylist.RelayListItem

data class SelectLocationListUiState(
    val relayListType: RelayListType,
    val relayListItems: List<RelayListItem>,
)
