package vu.vpn.feature.splittunneling.impl

import vu.vpn.feature.splittunneling.impl.applist.AppData

data class Loading(val isModal: Boolean = false)

data class SplitTunnelingUiState(
    val enabled: Boolean = false,
    val excludedApps: List<AppData> = emptyList(),
    val includedApps: List<AppData> = emptyList(),
    val showSystemApps: Boolean = false,
    val isModal: Boolean = false,
    // When false, the prominent-disclosure notice is shown and the installed-app
    // list has NOT been read yet. Flips to true only after the user opts in.
    val consentGranted: Boolean = true,
)
