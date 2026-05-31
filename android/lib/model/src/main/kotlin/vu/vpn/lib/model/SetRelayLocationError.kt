package vu.vpn.lib.model

sealed interface SetRelayLocationError {
    data class Unknown(val throwable: Throwable) : SetRelayLocationError
}
