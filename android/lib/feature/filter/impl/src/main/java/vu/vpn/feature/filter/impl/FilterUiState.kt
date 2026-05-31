package vu.vpn.feature.filter.impl

import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.Ownership
import vu.vpn.lib.model.ProviderId
import vu.vpn.lib.model.Providers

data class FilterUiState(
    private val providerToOwnerships: Map<ProviderId, Set<Ownership>> = emptyMap(),
    val selectedOwnership: Constraint<Ownership> = Constraint.Any,
    val selectedProviders: Constraint<Providers> = Constraint.Any,
) {
    val allProviders: Providers = providerToOwnerships.keys

    val selectableOwnerships: List<Ownership> =
        when (selectedProviders) {
            Constraint.Any -> Ownership.entries
            is Constraint.Only ->
                if (selectedProviders.value.isEmpty()) {
                    Ownership.entries
                } else {
                    providerToOwnerships
                        .filterKeys { it in selectedProviders.value }
                        .values
                        .flatten()
                        .distinct()
                }
        }.sorted()

    val selectableProviders: List<ProviderId> =
        when (selectedOwnership) {
            Constraint.Any -> allProviders.toList()
            is Constraint.Only ->
                providerToOwnerships.filterValues { selectedOwnership.value in it }.keys
        }.sorted()

    val isApplyButtonEnabled = selectedProviders.getOrNull()?.isNotEmpty() != false
    val removedProviders: List<ProviderId> =
        when (selectedProviders) {
            Constraint.Any -> emptyList()
            is Constraint.Only -> selectedProviders.value.toList() - allProviders
        }

    val isAllProvidersChecked = selectedProviders is Constraint.Any
}
