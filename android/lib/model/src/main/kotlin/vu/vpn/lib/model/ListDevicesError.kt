package vu.vpn.lib.model

interface ListDevicesError {
    data class Unknown(val throwable: Throwable) : ListDevicesError
}
