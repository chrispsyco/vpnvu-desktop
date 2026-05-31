package vu.vpn.feature.appinfo.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2

@Parcelize data class ChangelogNavKey(val isModal: Boolean = false) : NavKey2
