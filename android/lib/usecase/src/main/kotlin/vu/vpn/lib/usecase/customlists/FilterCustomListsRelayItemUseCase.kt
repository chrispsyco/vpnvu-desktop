package vu.vpn.lib.usecase.customlists

import kotlin.collections.map
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import vu.vpn.lib.common.util.relaylist.toRelayItemCustomList
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.repository.CustomListsRepository
import vu.vpn.lib.usecase.FilteredRelayListUseCase

class FilterCustomListsRelayItemUseCase(
    private val customListsRepository: CustomListsRepository,
    private val filteredRelayListUseCase: FilteredRelayListUseCase,
) {

    operator fun invoke(relayListType: RelayListType) =
        combine(customListsRepository.customLists, filteredRelayListUseCase(relayListType)) {
            customLists,
            filteredRelayList ->
            customLists?.map { it.toRelayItemCustomList(filteredRelayList) } ?: emptyList()
        }
}
