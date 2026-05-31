package vu.vpn.feature.managedevices.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.lib.model.AccountNumber

@Parcelize data class ManageDevicesNavKey(val accountNumber: AccountNumber) : NavKey2
