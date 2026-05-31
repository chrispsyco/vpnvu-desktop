package vu.vpn.feature.appicon.impl

import vu.vpn.feature.appicon.impl.obfuscation.AppObfuscation

data class AppIconUiState(
    val availableObfuscations: List<AppObfuscation> = emptyList(),
    val currentAppObfuscation: AppObfuscation? = null,
    val applyingChange: Boolean = false,
)
