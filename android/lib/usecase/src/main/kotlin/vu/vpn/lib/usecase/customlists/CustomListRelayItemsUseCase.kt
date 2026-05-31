package vu.vpn.lib.usecase.customlists

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.mapNotNull
import vu.vpn.lib.common.util.relaylist.getById
import vu.vpn.lib.common.util.relaylist.getRelayItemsByCodes
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.repository.CustomListsRepository
import vu.vpn.lib.repository.RelayListRepository

class CustomListRelayItemsUseCase(
    private val customListsRepository: CustomListsRepository,
    private val relayListRepository: RelayListRepository,
) {
    operator fun invoke(customListId: CustomListId): Flow<List<RelayItem.Location>> =
        combine(
            customListsRepository.customLists.mapNotNull { it?.getById(customListId) },
            relayListRepository.relayList,
        ) { customList, countries ->
            countries.getRelayItemsByCodes(customList.locations)
        }
}
