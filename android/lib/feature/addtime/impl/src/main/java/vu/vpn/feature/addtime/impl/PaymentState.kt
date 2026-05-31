package vu.vpn.feature.addtime.impl

import vu.vpn.lib.payment.model.PaymentProduct

sealed interface PaymentState {
    data object Loading : PaymentState

    data object NoPayment : PaymentState

    data object NoProductsFounds : PaymentState

    data class PaymentAvailable(val products: List<PaymentProduct>) : PaymentState

    sealed interface Error : PaymentState {
        data object Generic : Error

        data object Billing : Error
    }
}
