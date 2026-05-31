package vu.vpn.di

import vu.vpn.lib.payment.PaymentProvider
import org.koin.dsl.module

val paymentModule = module { single { PaymentProvider(null) } }
