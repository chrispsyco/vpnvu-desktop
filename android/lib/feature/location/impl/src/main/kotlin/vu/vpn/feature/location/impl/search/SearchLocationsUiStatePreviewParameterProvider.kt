package vu.vpn.feature.location.impl.search

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import vu.vpn.lib.common.Lce
import vu.vpn.lib.model.MultihopRelayListType
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.ui.component.relaylist.RelayListItemPreviewData
import vu.vpn.lib.usecase.FilterChip

class SearchLocationsUiStatePreviewParameterProvider :
    PreviewParameterProvider<Lce<Unit, SearchLocationUiState, Unit>> {
    override val values =
        sequenceOf(
            Lce.Loading(Unit),
            Lce.Content(
                SearchLocationUiState(
                    searchTerm = "",
                    filterChips = listOf(FilterChip.Entry),
                    relayListItems =
                        RelayListItemPreviewData.generateRelayListItems(
                            includeCustomLists = true,
                            isSearching = true,
                        ),
                    customLists = emptyList(),
                    relayListType = RelayListType.Multihop(MultihopRelayListType.ENTRY),
                )
            ),
            Lce.Error(Unit),
            Lce.Content(
                SearchLocationUiState(
                    searchTerm = "Mullvad",
                    filterChips = listOf(FilterChip.Entry),
                    relayListItems =
                        RelayListItemPreviewData.generateEmptyList("Mullvad", isSearching = true),
                    customLists = emptyList(),
                    relayListType = RelayListType.Multihop(MultihopRelayListType.ENTRY),
                )
            ),
            Lce.Content(
                SearchLocationUiState(
                    searchTerm = "Germany",
                    filterChips = listOf(FilterChip.Entry),
                    relayListItems =
                        RelayListItemPreviewData.generateRelayListItems(
                            includeCustomLists = true,
                            isSearching = true,
                        ),
                    customLists = emptyList(),
                    relayListType = RelayListType.Multihop(MultihopRelayListType.ENTRY),
                )
            ),
        )
}
