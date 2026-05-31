package vu.vpn.feature.location.impl

import arrow.core.Either
import arrow.core.getOrElse
import arrow.core.raise.either
import vu.vpn.lib.common.util.relaylist.descendants
import vu.vpn.lib.model.CustomList
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.GetCustomListError
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.communication.CustomListAction
import vu.vpn.lib.model.communication.CustomListActionResultData
import vu.vpn.lib.model.communication.LocationsChanged
import vu.vpn.lib.usecase.customlists.CustomListActionError

internal suspend fun addLocationToCustomList(
    customList: RelayItem.CustomList,
    item: RelayItem.Location,
    update:
        suspend (CustomListAction.UpdateLocations) -> Either<
                CustomListActionError,
                LocationsChanged,
            >,
): CustomListActionResultData {
    val newLocations =
        (customList.locations + item).filter { it !in item.descendants() }.map { it.id }
    return update(CustomListAction.UpdateLocations(customList.id, newLocations))
        .fold(
            { CustomListActionResultData.GenericError },
            {
                if (it.removedLocations.isEmpty()) {
                    CustomListActionResultData.Success.LocationAdded(
                        customListName = it.name,
                        locationName = item.name,
                        undo = it.undo,
                    )
                } else {
                    CustomListActionResultData.Success.LocationChanged(
                        customListName = it.name,
                        undo = it.undo,
                    )
                }
            },
        )
}

internal suspend fun removeLocationFromCustomList(
    item: RelayItem.Location,
    customListId: CustomListId,
    getCustomListById: suspend (CustomListId) -> Either<GetCustomListError, CustomList>,
    update:
        suspend (CustomListAction.UpdateLocations) -> Either<
                CustomListActionError,
                LocationsChanged,
            >,
) =
    either {
            val customList = getCustomListById(customListId).bind()
            val newLocations = (customList.locations - item.id)
            val success =
                update(CustomListAction.UpdateLocations(customList.id, newLocations)).bind()
            if (success.addedLocations.isEmpty()) {
                CustomListActionResultData.Success.LocationRemoved(
                    customListName = success.name,
                    locationName = item.name,
                    undo = success.undo,
                )
            } else {
                CustomListActionResultData.Success.LocationChanged(
                    customListName = success.name,
                    undo = success.undo,
                )
            }
        }
        .getOrElse { CustomListActionResultData.GenericError }
