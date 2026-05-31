package vu.vpn.feature.location.impl.list

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import vu.vpn.lib.common.Lce
import vu.vpn.lib.model.MultihopRelayListType
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.ui.component.relaylist.RelayListItemPreviewData

class SelectLocationsListUiStatePreviewParameterProvider :
    PreviewParameterProvider<Lce<Unit, SelectLocationListUiState, Unit>> {
    override val values =
        sequenceOf(
            Lce.Content(
                SelectLocationListUiState(
                    relayListItems =
                        RelayListItemPreviewData.generateRelayListItems(
                            includeCustomLists = true,
                            isSearching = false,
                        ),
                    relayListType = RelayListType.Multihop(MultihopRelayListType.EXIT),
                )
            ),
            Lce.Loading(Unit),
            Lce.Error(Unit),
        )
}
