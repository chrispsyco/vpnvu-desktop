package vu.vpn.lib.model

interface EnableSplitTunnelingError {
    data class Unknown(val throwable: Throwable) : EnableSplitTunnelingError
}
