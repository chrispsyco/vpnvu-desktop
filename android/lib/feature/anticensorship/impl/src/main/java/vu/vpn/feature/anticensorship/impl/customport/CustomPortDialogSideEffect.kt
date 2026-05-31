package vu.vpn.feature.anticensorship.impl.customport

import vu.vpn.lib.model.Port

sealed interface CustomPortDialogSideEffect {
    data class Success(val port: Port?) : CustomPortDialogSideEffect
}
