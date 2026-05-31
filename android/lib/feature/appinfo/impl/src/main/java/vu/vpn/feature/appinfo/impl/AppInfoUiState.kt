package vu.vpn.feature.appinfo.impl

import vu.vpn.lib.model.VersionInfo

data class AppInfoUiState(val version: VersionInfo, val isPlayBuild: Boolean)
