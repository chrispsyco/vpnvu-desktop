package vu.vpn.lib.usecase

import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import mullvad_daemon.relay_selector.exitConstraints
import vu.vpn.lib.common.util.isDaitaAndNotDirectOnly
import vu.vpn.lib.common.util.relaylist.filter
import vu.vpn.lib.grpc.ManagementService
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.DiscardedRelay
import vu.vpn.lib.model.EntryConstraints
import vu.vpn.lib.model.ExitConstraints
import vu.vpn.lib.model.MultihopConstraints
import vu.vpn.lib.model.MultihopRelayListType
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.RelayItemId
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.model.RelayPartitions
import vu.vpn.lib.model.RelaySelectorPredicate
import vu.vpn.lib.model.Settings
import vu.vpn.lib.repository.RelayListRepository
import vu.vpn.lib.repository.SettingsRepository

class FilteredRelayListUseCase(
    private val relayListRepository: RelayListRepository,
    private val settingsRepository: SettingsRepository,
    private val managementService: ManagementService,
) {
    operator fun invoke(relayListType: RelayListType) =
        combine(
            settingsRepository.settingsUpdates
                .filterNotNull()
                .map {
                    when (relayListType) {
                        is RelayListType.Multihop ->
                            when (relayListType.multihopRelayListType) {
                                MultihopRelayListType.ENTRY ->
                                    RelaySelectorPredicate.Entry(
                                        multihopConstraints =
                                            MultihopConstraints(
                                                entryConstraints =
                                                    it.toEntryConstraint(Constraint.Any),
                                                exitConstraints = it.toExitConstraint(),
                                            )
                                    )
                                MultihopRelayListType.EXIT ->
                                    RelaySelectorPredicate.Exit(
                                        multihopConstraints =
                                            MultihopConstraints(
                                                entryConstraints = it.toEntryConstraint(),
                                                exitConstraints =
                                                    it.toExitConstraint(Constraint.Any),
                                            )
                                    )
                            }
                        RelayListType.Single ->
                            if (it.isDaitaAndNotDirectOnly()) {
                                RelaySelectorPredicate.Autohop(it.toEntryConstraint(Constraint.Any))
                            } else {
                                RelaySelectorPredicate.SingleHop(
                                    it.toEntryConstraint(Constraint.Any)
                                )
                            }
                    }
                }
                .distinctUntilChanged()
                .map {
                    // We expect this to always work
                    managementService.partitionRelays(it).getOrNull()!!
                },
            relayListRepository.relayList,
        ) { partitions, relayList ->
            relayList.filter(partitions.relevantHostnames())
        }

    private fun RelayPartitions.relevantHostnames() =
        matches + discards.filter { it.shouldBeShown() }.map { it.hostname }

    private fun DiscardedRelay.shouldBeShown(): Boolean =
        with(why) {
            (conflictWithOtherHop or inactive) &&
                !location &&
                !providers &&
                !ownership &&
                !ipVersion &&
                !daita &&
                !obfuscation &&
                !port
        }

    private fun List<RelayItem.Location.Country>.filter(validHostnames: List<String>) = mapNotNull {
        it.filter(validHostnames)
    }
}

private fun Settings.toEntryConstraint(
    overrideExitLocation: Constraint<RelayItemId>? = null
): EntryConstraints =
    EntryConstraints(
        generalConstraints =
            ExitConstraints(
                location = overrideExitLocation ?: relaySettings.relayConstraints.location,
                providers = relaySettings.relayConstraints.providers,
                ownership = relaySettings.relayConstraints.ownership,
            ),
        obfuscation = Constraint.Only(obfuscationSettings),
        daitaSettings = Constraint.Only(tunnelOptions.daitaSettings),
        ipVersion = relaySettings.relayConstraints.wireguardConstraints.ipVersion,
    )

private fun Settings.toExitConstraint(
    overrideEntryLocation: Constraint<RelayItemId>? = null
): ExitConstraints =
    ExitConstraints(
        location = overrideEntryLocation ?: relaySettings.relayConstraints.location,
        providers = relaySettings.relayConstraints.providers,
        ownership = relaySettings.relayConstraints.ownership,
    )
