package vu.vpn.lib.usecase

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import vu.vpn.lib.model.Ownership
import vu.vpn.lib.model.ProviderId
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.repository.RelayListRepository

class ProviderToOwnershipsUseCase(private val relayListRepository: RelayListRepository) {
    operator fun invoke(): Flow<Map<ProviderId, Set<Ownership>>> =
        relayListRepository.relayList.map { relayList ->
            relayList
                .flatMap(RelayItem.Location.Country::cities)
                .flatMap(RelayItem.Location.City::relays)
                .groupBy({ it.provider }, { it.ownership })
                .mapValues { (_, ownerships) -> ownerships.toSet() }
        }
}
