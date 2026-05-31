package vu.vpn.feature.filter.impl

import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.Ownership
import vu.vpn.lib.model.Providers

fun Ownership?.toOwnershipConstraint(): Constraint<Ownership> =
    when (this) {
        null -> Constraint.Any
        else -> Constraint.Only(this)
    }

fun Providers.toConstraintProviders(allProviders: Providers): Constraint<Providers> =
    if (size == allProviders.size) {
        Constraint.Any
    } else {
        Constraint.Only(this)
    }
