package vu.vpn.lib.usecase

import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.ensure
import arrow.core.raise.ensureNotNull
import vu.vpn.lib.common.util.isDaitaAndNotDirectOnly
import vu.vpn.lib.common.util.relaylist.isTheSameAs
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.repository.RelayListRepository
import vu.vpn.lib.repository.SettingsRepository

class SelectAndEnableMultihopUseCase(
    private val relayListRepository: RelayListRepository,
    private val settingsRepository: SettingsRepository,
) {
    suspend operator fun invoke(
        entry: RelayItem?,
        exit: RelayItem,
    ): Either<SelectRelayItemError, Unit> = either {
        ensureNotNull(entry) { SelectRelayItemError.GenericError }
        ensure(entry.active) { SelectRelayItemError.RelayInactive(entry) }
        ensure(exit.active) { SelectRelayItemError.RelayInactive(exit) }
        val settings =
            ensureNotNull(settingsRepository.settingsUpdates.value) {
                SelectRelayItemError.GenericError
            }
        // If the entry selection is selected automatically by the app and not the user we should
        // not consider if the entry and exit are the same
        if (!settings.isDaitaAndNotDirectOnly()) {
            ensure(!entry.isTheSameAs(exit)) { SelectRelayItemError.EntryAndExitSame }
        }
        relayListRepository
            .updateSelectedRelayLocationMultihop(
                isMultihopEnabled = true,
                entry = entry.id,
                exit = exit.id,
            )
            .mapLeft { SelectRelayItemError.GenericError }
    }
}
