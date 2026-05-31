package vu.vpn.feature.login.impl.apiunreachable

import vu.vpn.feature.login.api.LoginAction

data class ApiUnreachableUiState(
    val showEnableAllAccessMethodsButton: Boolean,
    val noEmailAppAvailable: Boolean,
    val loginAction: LoginAction,
)
