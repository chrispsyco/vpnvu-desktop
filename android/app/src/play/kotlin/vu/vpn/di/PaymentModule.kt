package vu.vpn.di

import vu.vpn.lib.billing.BillingPaymentRepository
import vu.vpn.lib.billing.BillingRepository
import vu.vpn.lib.billing.PlayPurchaseRepository
import vu.vpn.lib.payment.PaymentProvider
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.module

val paymentModule = module {
    single { BillingRepository(androidContext()) }
    single { PaymentProvider(BillingPaymentRepository(get(), get())) }
    single { PlayPurchaseRepository(get()) }
}
