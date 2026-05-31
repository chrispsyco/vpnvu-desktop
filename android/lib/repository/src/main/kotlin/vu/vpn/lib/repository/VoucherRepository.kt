package vu.vpn.lib.repository

import vu.vpn.lib.grpc.ManagementService
import vu.vpn.lib.model.VoucherCode

class VoucherRepository(
    private val managementService: ManagementService,
    private val accountRepository: AccountRepository,
) {
    suspend fun submitVoucher(voucher: VoucherCode) =
        managementService.submitVoucher(voucher).onRight {
            accountRepository.onVoucherRedeemed(it.newExpiryDate)
        }
}
