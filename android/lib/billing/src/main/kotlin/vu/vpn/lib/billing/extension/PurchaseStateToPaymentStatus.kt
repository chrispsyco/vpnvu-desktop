package vu.vpn.lib.billing.extension

import com.android.billingclient.api.Purchase
import vu.vpn.lib.payment.model.PaymentStatus

internal fun Int.toPaymentStatus(): PaymentStatus? =
    when (this) {
        Purchase.PurchaseState.PURCHASED -> PaymentStatus.VERIFICATION_IN_PROGRESS
        Purchase.PurchaseState.PENDING -> PaymentStatus.PENDING
        else -> null
    }
