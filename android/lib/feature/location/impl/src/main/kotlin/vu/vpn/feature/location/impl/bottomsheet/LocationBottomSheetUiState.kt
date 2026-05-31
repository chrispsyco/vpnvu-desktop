package vu.vpn.feature.location.impl.bottomsheet

import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.CustomListName
import vu.vpn.lib.model.RelayItem

sealed interface LocationBottomSheetUiState {
    val item: RelayItem
    val setAsEntryState: SetAsState
    val setAsExitState: SetAsState
    val canDisableMultihop: Boolean

    data class CustomListsEntry(
        override val item: RelayItem.Location,
        override val setAsEntryState: SetAsState,
        override val setAsExitState: SetAsState,
        override val canDisableMultihop: Boolean,
        val customListId: CustomListId,
        val customListName: CustomListName,
    ) : LocationBottomSheetUiState

    data class Location(
        override val item: RelayItem.Location,
        override val setAsEntryState: SetAsState,
        override val setAsExitState: SetAsState,
        override val canDisableMultihop: Boolean,
        val customLists: List<RelayItem.CustomList>,
    ) : LocationBottomSheetUiState

    data class CustomList(
        override val item: RelayItem.CustomList,
        override val setAsEntryState: SetAsState,
        override val setAsExitState: SetAsState,
        override val canDisableMultihop: Boolean,
    ) : LocationBottomSheetUiState
}

enum class SetAsState {
    HIDDEN,
    DISABLED,
    ENABLED,
}
