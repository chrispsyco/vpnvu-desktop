package vu.vpn.feature.addtime.impl

import vu.vpn.feature.addtime.impl.PaymentState.PaymentAvailable
import vu.vpn.lib.payment.model.PaymentAvailability

fun PaymentAvailability.toPaymentState(): PaymentState =
    when (this) {
        PaymentAvailability.Error.ServiceUnavailable,
        PaymentAvailability.Error.BillingUnavailable -> PaymentState.Error.Billing
        is PaymentAvailability.Error.Other -> PaymentState.Error.Generic
        is PaymentAvailability.ProductsAvailable -> PaymentAvailable(products)
        PaymentAvailability.ProductsUnavailable -> PaymentState.NoPayment
        PaymentAvailability.NoProductsFound -> PaymentState.NoProductsFounds
        PaymentAvailability.Loading -> PaymentState.Loading
        // Unrecoverable error states
        PaymentAvailability.Error.DeveloperError,
        PaymentAvailability.Error.FeatureNotSupported,
        PaymentAvailability.Error.ItemUnavailable -> PaymentState.NoPayment
    }
