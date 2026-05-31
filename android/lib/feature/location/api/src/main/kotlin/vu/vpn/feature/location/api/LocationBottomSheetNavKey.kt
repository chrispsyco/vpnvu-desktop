package vu.vpn.feature.location.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.communication.CustomListActionResultData

@Parcelize data class LocationBottomSheetNavKey(val state: LocationBottomSheetState) : NavKey2

@Parcelize
sealed interface LocationBottomSheetNavResult : NavResult {

    data class CustomListActionToast(val resultData: CustomListActionResultData) :
        LocationBottomSheetNavResult

    data object GenericError : LocationBottomSheetNavResult

    data class RelayItemInactive(val relayItem: RelayItem) : LocationBottomSheetNavResult

    data class EntryAlreadySelected(val relayItem: RelayItem) : LocationBottomSheetNavResult

    data class ExitAlreadySelected(val relayItem: RelayItem) : LocationBottomSheetNavResult

    data object EntryAndExitAreSame : LocationBottomSheetNavResult

    data class MultihopChanged(val undoChangeMultihopAction: UndoChangeMultihopAction) :
        LocationBottomSheetNavResult
}
