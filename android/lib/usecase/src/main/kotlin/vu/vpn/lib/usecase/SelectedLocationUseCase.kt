package vu.vpn.lib.usecase

import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.filterNotNull
import vu.vpn.lib.model.RelayItemSelection
import vu.vpn.lib.repository.RelayListRepository
import vu.vpn.lib.repository.WireguardConstraintsRepository

class SelectedLocationUseCase(
    private val relayListRepository: RelayListRepository,
    private val wireguardConstraintsRepository: WireguardConstraintsRepository,
) {
    operator fun invoke() =
        combine(
            relayListRepository.selectedLocation.filterNotNull(),
            wireguardConstraintsRepository.wireguardConstraints.filterNotNull(),
        ) { selectedLocation, wireguardConstraints ->
            if (wireguardConstraints.isMultihopEnabled) {
                RelayItemSelection.Multiple(
                    entryLocation = wireguardConstraints.entryLocation,
                    exitLocation = selectedLocation,
                )
            } else {
                RelayItemSelection.Single(selectedLocation)
            }
        }
}
