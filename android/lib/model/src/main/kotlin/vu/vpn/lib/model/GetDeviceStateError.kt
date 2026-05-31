package vu.vpn.lib.model

sealed interface GetDeviceStateError {
    data class Unknown(val error: Throwable) : GetDeviceStateError
}
