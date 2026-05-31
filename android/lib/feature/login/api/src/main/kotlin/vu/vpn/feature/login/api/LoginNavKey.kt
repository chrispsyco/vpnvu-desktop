package vu.vpn.feature.login.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2

@Parcelize data class LoginNavKey(val accountNumber: String? = null) : NavKey2
