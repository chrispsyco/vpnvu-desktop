package vu.vpn.feature.notification.impl

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import vu.vpn.lib.common.Lc

class NotificationSettingsUiStatePreviewParameterProvider :
    PreviewParameterProvider<Lc<Unit, NotificationSettingsUiState>> {
    override val values: Sequence<Lc<Unit, NotificationSettingsUiState>> =
        sequenceOf(
            Lc.Loading(Unit),
            Lc.Content(NotificationSettingsUiState(locationInNotificationEnabled = true)),
        )
}
