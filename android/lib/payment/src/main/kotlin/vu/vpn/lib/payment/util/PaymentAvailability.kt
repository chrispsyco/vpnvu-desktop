package vu.vpn.lib.payment.util

import vu.vpn.lib.payment.model.PaymentAvailability

fun PaymentAvailability?.hasPendingPayment(): Boolean =
    when (this) {
        is PaymentAvailability.ProductsAvailable -> this.products.any { it.status != null }
        else -> false
    }
