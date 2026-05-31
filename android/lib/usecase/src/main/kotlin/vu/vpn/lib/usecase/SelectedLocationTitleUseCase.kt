package vu.vpn.lib.usecase

import arrow.core.raise.nullable
import kotlinx.coroutines.flow.combine
import vu.vpn.lib.common.util.relaylist.findCity
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.CustomList
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.GeoLocationId
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.RelayItemId
import vu.vpn.lib.repository.CustomListsRepository
import vu.vpn.lib.repository.RelayListRepository

class SelectedLocationTitleUseCase(
    private val customListsRepository: CustomListsRepository,
    private val relayListRepository: RelayListRepository,
) {
    operator fun invoke() =
        combine(
            customListsRepository.customLists,
            relayListRepository.relayList,
            relayListRepository.selectedLocation,
        ) { customLists, relayList, selectedLocation ->
            if (selectedLocation is Constraint.Only) {
                createRelayItemTitle(selectedLocation.value, relayList, customLists ?: emptyList())
            } else {
                null
            }
        }

    private fun createRelayItemTitle(
        relayItemId: RelayItemId,
        relayCountries: List<RelayItem.Location.Country>,
        customLists: List<CustomList>,
    ): String? =
        when (relayItemId) {
            is CustomListId -> customLists.firstOrNull { it.id == relayItemId }?.name?.value
            is GeoLocationId.Hostname -> createRelayTitle(relayCountries, relayItemId)
            is GeoLocationId.City -> relayCountries.findCity(relayItemId)?.name
            is GeoLocationId.Country -> relayCountries.firstOrNull { it.id == relayItemId }?.name
        }

    private fun createRelayTitle(
        relayCountries: List<RelayItem.Location.Country>,
        relayItemId: GeoLocationId.Hostname,
    ): String? = nullable {
        val city = relayCountries.findCity(relayItemId.city).bind()
        val relay = city.relays.find { it.id == relayItemId }.bind()

        relay.formatTitle(city)
    }

    private fun RelayItem.Location.Relay.formatTitle(city: RelayItem.Location.City) =
        "${city.name} (${name})"
}
