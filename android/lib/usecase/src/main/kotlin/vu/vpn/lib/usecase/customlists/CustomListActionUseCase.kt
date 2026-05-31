package vu.vpn.lib.usecase.customlists

import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.ensure
import kotlinx.coroutines.flow.firstOrNull
import vu.vpn.lib.common.util.relaylist.getRelayItemsByCodes
import vu.vpn.lib.model.CreateCustomListError
import vu.vpn.lib.model.DeleteCustomListError
import vu.vpn.lib.model.GetCustomListError
import vu.vpn.lib.model.NameIsEmpty
import vu.vpn.lib.model.UpdateCustomListLocationsError
import vu.vpn.lib.model.UpdateCustomListNameError
import vu.vpn.lib.model.communication.Created
import vu.vpn.lib.model.communication.CustomListAction
import vu.vpn.lib.model.communication.CustomListSuccess
import vu.vpn.lib.model.communication.Deleted
import vu.vpn.lib.model.communication.LocationsChanged
import vu.vpn.lib.model.communication.Renamed
import vu.vpn.lib.repository.CustomListsRepository
import vu.vpn.lib.repository.RelayListRepository

class CustomListActionUseCase(
    private val customListsRepository: CustomListsRepository,
    private val relayListRepository: RelayListRepository,
) {
    suspend operator fun invoke(
        action: CustomListAction
    ): Either<CustomListActionError, CustomListSuccess> {
        return when (action) {
            is CustomListAction.Create -> {
                invoke(action)
            }
            is CustomListAction.Rename -> {
                invoke(action)
            }
            is CustomListAction.Delete -> {
                invoke(action)
            }
            is CustomListAction.UpdateLocations -> {
                invoke(action)
            }
        }
    }

    suspend operator fun invoke(action: CustomListAction.Rename): Either<RenameError, Renamed> =
        either {
            ensure(action.newName.value.isNotBlank()) { RenameError(NameIsEmpty(action.name)) }

            customListsRepository
                .updateCustomListName(action.id, action.newName)
                .map { Renamed(undo = action.not()) }
                .mapLeft(::RenameError)
                .bind()
        }

    suspend operator fun invoke(
        action: CustomListAction.Create
    ): Either<CreateWithLocationsError, Created> = either {
        ensure(action.name.value.isNotBlank()) {
            CreateWithLocationsError.Create(NameIsEmpty(action.name))
        }

        val customListId =
            customListsRepository
                .createCustomList(action.name, action.locations)
                .mapLeft(CreateWithLocationsError::Create)
                .bind()

        val locationNames =
            if (action.locations.isNotEmpty()) {
                relayListRepository.relayList
                    .firstOrNull()
                    ?.getRelayItemsByCodes(action.locations)
                    ?.map { it.name } ?: raise(CreateWithLocationsError.UnableToFetchRelayList)
            } else {
                emptyList()
            }

        Created(
            id = customListId,
            name = action.name,
            locationNames = locationNames,
            undo = action.not(customListId),
        )
    }

    suspend operator fun invoke(
        action: CustomListAction.Delete
    ): Either<DeleteWithUndoError, Deleted> = either {
        val customList =
            customListsRepository
                .getCustomListById(action.id)
                .mapLeft(DeleteWithUndoError::Fetch)
                .bind()
        customListsRepository
            .deleteCustomList(action.id)
            .mapLeft(DeleteWithUndoError::Delete)
            .bind()
        Deleted(undo = action.not(locations = customList.locations, name = customList.name))
    }

    suspend operator fun invoke(
        action: CustomListAction.UpdateLocations
    ): Either<UpdateLocationsError, LocationsChanged> = either {
        val customList =
            customListsRepository
                .getCustomListById(action.id)
                .mapLeft(UpdateLocationsError::Fetch)
                .bind()
        customListsRepository
            .updateCustomListLocations(action.id, action.locations)
            .mapLeft(UpdateLocationsError::UpdateLocations)
            .bind()
        LocationsChanged(
            id = action.id,
            name = customList.name,
            locations = action.locations,
            oldLocations = customList.locations,
        )
    }
}

sealed interface CustomListActionError

sealed interface CreateWithLocationsError : CustomListActionError {

    data class Create(val error: CreateCustomListError) : CreateWithLocationsError

    data object UnableToFetchRelayList : CreateWithLocationsError
}

sealed interface DeleteWithUndoError : CustomListActionError {
    data class Fetch(val error: GetCustomListError) : DeleteWithUndoError

    data class Delete(val error: DeleteCustomListError) : DeleteWithUndoError
}

data class RenameError(val error: UpdateCustomListNameError) : CustomListActionError

sealed interface UpdateLocationsError : CustomListActionError {

    data class Fetch(val error: GetCustomListError) : UpdateLocationsError

    data class UpdateLocations(val error: UpdateCustomListLocationsError) : UpdateLocationsError
}
