package vu.vpn.feature.login.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.lib.model.AccountNumber

@Parcelize data class DeviceListNavKey(val accountNumber: AccountNumber) : NavKey2
