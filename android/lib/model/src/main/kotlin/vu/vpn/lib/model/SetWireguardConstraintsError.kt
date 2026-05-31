package vu.vpn.lib.model

sealed interface SetWireguardConstraintsError {
    data class Unknown(val throwable: Throwable) : SetWireguardConstraintsError
}
