package vu.vpn.lib.billing

import vu.vpn.lib.grpc.ManagementService
import vu.vpn.lib.model.PlayPurchase

class PlayPurchaseRepository(private val managementService: ManagementService) {
    suspend fun initializePlayPurchase() = managementService.initializePlayPurchase()

    suspend fun verifyPlayPurchase(purchase: PlayPurchase) =
        managementService.verifyPlayPurchase(purchase)
}
