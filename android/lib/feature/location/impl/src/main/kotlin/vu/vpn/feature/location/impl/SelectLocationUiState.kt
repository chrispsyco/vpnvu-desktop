package vu.vpn.feature.location.impl

import vu.vpn.lib.model.ErrorStateCause
import vu.vpn.lib.model.HopSelection
import vu.vpn.lib.model.MultihopRelayListType
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.usecase.FilterChip

data class SelectLocationUiState(
    val filterChips: List<FilterChip>,
    val multihopListSelection: MultihopRelayListType,
    val isSearchButtonEnabled: Boolean,
    val isFilterButtonEnabled: Boolean,
    val isRecentsEnabled: Boolean,
    val hopSelection: HopSelection,
    val tunnelErrorStateCause: ErrorStateCause?,
) {
    val multihopEnabled: Boolean = hopSelection is HopSelection.Multi
    val relayListType =
        if (multihopEnabled) RelayListType.Multihop(multihopListSelection) else RelayListType.Single
}
