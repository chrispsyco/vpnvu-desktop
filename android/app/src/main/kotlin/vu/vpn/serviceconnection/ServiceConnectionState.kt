package vu.vpn.serviceconnection

sealed class ServiceConnectionState {
    data object Bound : ServiceConnectionState()

    data object Unbound : ServiceConnectionState()
}
