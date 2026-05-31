package vu.vpn.lib.payment.util

import arrow.core.Either
import vu.vpn.lib.payment.model.VerificationError
import vu.vpn.lib.payment.model.VerificationResult

fun Either<VerificationError, VerificationResult>.isSuccess() =
    getOrNull() == VerificationResult.Success
