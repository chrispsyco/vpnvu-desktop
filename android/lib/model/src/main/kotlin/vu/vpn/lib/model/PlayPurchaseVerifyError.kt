package vu.vpn.lib.model

enum class PlayPurchaseVerifyError {
    NoProducts,
    MissingObfuscatedAccountId,
    NoPurchaseToken,
    InvalidPurchase,
    OtherError,
}
