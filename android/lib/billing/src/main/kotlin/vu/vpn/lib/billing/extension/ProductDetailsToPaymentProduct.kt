package vu.vpn.lib.billing.extension

import com.android.billingclient.api.ProductDetails
import vu.vpn.lib.payment.model.PaymentProduct
import vu.vpn.lib.payment.model.PaymentStatus
import vu.vpn.lib.payment.model.ProductId
import vu.vpn.lib.payment.model.ProductPrice

fun ProductDetails.toPaymentProduct(productIdToStatus: Map<String, PaymentStatus?>) =
    PaymentProduct(
        productId = ProductId(this.productId),
        price = ProductPrice(this.oneTimePurchaseOfferDetails?.formattedPrice ?: ""),
        productIdToStatus[this.productId],
    )

fun List<ProductDetails>.toPaymentProducts(productIdToStatus: Map<String, PaymentStatus?>) =
    this.map { it.toPaymentProduct(productIdToStatus) }
