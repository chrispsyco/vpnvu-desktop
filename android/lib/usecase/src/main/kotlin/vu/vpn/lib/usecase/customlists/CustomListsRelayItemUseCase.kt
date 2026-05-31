package vu.vpn.lib.usecase.customlists

import kotlinx.coroutines.flow.combine
import vu.vpn.lib.common.util.relaylist.toRelayItemCustomList
import vu.vpn.lib.repository.CustomListsRepository
import vu.vpn.lib.repository.RelayListRepository

class CustomListsRelayItemUseCase(
    private val customListsRepository: CustomListsRepository,
    private val relayListRepository: RelayListRepository,
) {

    operator fun invoke() =
        combine(customListsRepository.customLists, relayListRepository.relayList) {
            customLists,
            relayList ->
            customLists?.map { it.toRelayItemCustomList(relayList) } ?: emptyList()
        }
}
