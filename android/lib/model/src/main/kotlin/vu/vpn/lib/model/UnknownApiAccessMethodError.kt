package vu.vpn.lib.model

data class UnknownApiAccessMethodError(val throwable: Throwable) : UpdateApiAccessMethodError
