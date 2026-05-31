package vu.vpn.lib.model

sealed interface DeleteDeviceError {
    data class Unknown(val error: Throwable) : DeleteDeviceError
}
