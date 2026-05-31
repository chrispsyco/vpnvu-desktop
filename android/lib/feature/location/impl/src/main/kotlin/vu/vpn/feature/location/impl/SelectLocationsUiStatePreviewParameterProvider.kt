package vu.vpn.feature.location.impl

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.toLc
import vu.vpn.lib.model.HopSelection
import vu.vpn.lib.model.MultihopRelayListType
import vu.vpn.lib.usecase.FilterChip
import vu.vpn.lib.usecase.ModelOwnership

class SelectLocationsUiStatePreviewParameterProvider :
    PreviewParameterProvider<Lc<Unit, SelectLocationUiState>> {
    override val values =
        sequenceOf(
            Lc.Loading(Unit),
            SelectLocationUiState(
                    filterChips = emptyList(),
                    multihopListSelection = MultihopRelayListType.EXIT,
                    isSearchButtonEnabled = true,
                    isFilterButtonEnabled = true,
                    isRecentsEnabled = true,
                    hopSelection = HopSelection.Single(null),
                    tunnelErrorStateCause = null,
                )
                .toLc(),
            SelectLocationUiState(
                    filterChips =
                        listOf(
                            FilterChip.Ownership(ownership = ModelOwnership.Rented),
                            FilterChip.Provider(PROVIDER_COUNT),
                        ),
                    multihopListSelection = MultihopRelayListType.EXIT,
                    isSearchButtonEnabled = true,
                    isFilterButtonEnabled = true,
                    isRecentsEnabled = true,
                    hopSelection = HopSelection.Single(null),
                    tunnelErrorStateCause = null,
                )
                .toLc(),
            SelectLocationUiState(
                    filterChips = emptyList(),
                    multihopListSelection = MultihopRelayListType.ENTRY,
                    isSearchButtonEnabled = true,
                    isFilterButtonEnabled = true,
                    isRecentsEnabled = true,
                    hopSelection = HopSelection.Multi(null, null),
                    tunnelErrorStateCause = null,
                )
                .toLc(),
            SelectLocationUiState(
                    filterChips =
                        listOf(
                            FilterChip.Ownership(ownership = ModelOwnership.MullvadOwned),
                            FilterChip.Provider(PROVIDER_COUNT),
                        ),
                    multihopListSelection = MultihopRelayListType.ENTRY,
                    isSearchButtonEnabled = true,
                    isFilterButtonEnabled = true,
                    isRecentsEnabled = true,
                    hopSelection = HopSelection.Multi(null, null),
                    tunnelErrorStateCause = null,
                )
                .toLc(),
        )
}

private const val PROVIDER_COUNT = 3
