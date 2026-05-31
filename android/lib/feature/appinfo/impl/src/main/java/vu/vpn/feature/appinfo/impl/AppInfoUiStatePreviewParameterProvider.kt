package vu.vpn.feature.appinfo.impl

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.toLc
import vu.vpn.lib.model.VersionInfo

class AppInfoUiStatePreviewParameterProvider : PreviewParameterProvider<Lc<Unit, AppInfoUiState>> {
    override val values: Sequence<Lc<Unit, AppInfoUiState>> =
        sequenceOf(
            Lc.Loading(Unit),
            AppInfoUiState(
                    version = VersionInfo(currentVersion = "2024.9", isSupported = true),
                    isPlayBuild = true,
                )
                .toLc(),
            AppInfoUiState(
                    version = VersionInfo(currentVersion = "2024.9", isSupported = false),
                    isPlayBuild = true,
                )
                .toLc(),
        )
}
