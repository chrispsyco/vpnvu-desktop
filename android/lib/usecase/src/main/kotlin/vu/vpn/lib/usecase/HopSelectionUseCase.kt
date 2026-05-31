package vu.vpn.lib.usecase

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.filterNotNull
import vu.vpn.lib.common.util.entryBlocked
import vu.vpn.lib.common.util.isMultihopEnabled
import vu.vpn.lib.common.util.relaylist.findByGeoLocationId
import vu.vpn.lib.common.util.wireguardConstraints
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.GeoLocationId
import vu.vpn.lib.model.HopSelection
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.RelayItemId
import vu.vpn.lib.repository.RelayListRepository
import vu.vpn.lib.repository.SettingsRepository
import vu.vpn.lib.usecase.customlists.CustomListsRelayItemUseCase

class HopSelectionUseCase(
    private val customListRelayItemUseCase: CustomListsRelayItemUseCase,
    private val relayListRepository: RelayListRepository,
    private val settingsRepository: SettingsRepository,
) {
    operator fun invoke(): Flow<HopSelection> =
        combine(
            customListRelayItemUseCase(),
            relayListRepository.relayList,
            settingsRepository.settingsUpdates.filterNotNull(),
            relayListRepository.selectedLocation,
        ) { customLists, relayList, settings, selectedExitLocation ->
            if (settings.isMultihopEnabled()) {
                val entry =
                    if (settings.entryBlocked()) {
                        Constraint.Any
                    } else {
                        settings
                            .wireguardConstraints()
                            .entryLocation
                            .toRelayItemConstraint(customLists, relayList)
                    }
                HopSelection.Multi(
                    entry,
                    selectedExitLocation.toRelayItemConstraint(customLists, relayList),
                )
            } else {
                HopSelection.Single(
                    selectedExitLocation.toRelayItemConstraint(customLists, relayList)
                )
            }
        }

    private fun Constraint<RelayItemId>.toRelayItemConstraint(
        customLists: List<RelayItem.CustomList>,
        relayList: List<RelayItem.Location.Country>,
    ): Constraint<RelayItem>? =
        if (this is Constraint.Only) {
            when (val id = this.value) {
                is CustomListId -> customLists.firstOrNull { it.id == id }
                is GeoLocationId -> relayList.findByGeoLocationId(id)
            }?.let(Constraint<RelayItem>::Only)
        } else {
            Constraint.Any
        }
}
