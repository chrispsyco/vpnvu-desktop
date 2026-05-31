package vu.vpn.lib.model

sealed interface SetDaitaSettingsError {
    data class Unknown(val throwable: Throwable) : SetDaitaSettingsError
}
