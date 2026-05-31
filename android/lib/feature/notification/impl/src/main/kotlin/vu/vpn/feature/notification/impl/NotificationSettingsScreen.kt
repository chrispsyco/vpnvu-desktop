package vu.vpn.feature.notification.impl

import vu.vpn.lib.ui.resource.R

import androidx.compose.animation.ExperimentalSharedTransitionApi
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.systemBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.OpenInNew
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.unit.sp
import vu.vpn.lib.ui.theme.typeface.GeistMonoFontFamily
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewParameter
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import vu.vpn.common.compose.CollectSideEffectWithLifecycle
import vu.vpn.common.compose.isTv
import vu.vpn.common.compose.unlessIsDetail
import vu.vpn.core.Navigator
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.util.openAppInfoNotificationSettings
import vu.vpn.lib.ui.component.ScaffoldWithSmallTopBar
import vu.vpn.lib.ui.component.button.NavigateBackIconButton
import vu.vpn.lib.ui.component.drawVerticalScrollbar
import vu.vpn.lib.ui.component.listitem.SwitchListItem
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorLarge
import vu.vpn.lib.ui.designsystem.PrimaryButton
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.theme.color.AlphaScrollbar
import org.koin.androidx.compose.koinViewModel

@Preview("Loading|Normal")
@Composable
private fun PreviewNotificationSettingsScreen(
    @PreviewParameter(NotificationSettingsUiStatePreviewParameterProvider::class)
    state: Lc<Unit, NotificationSettingsUiState>
) {
    AppTheme {
        NotificationSettingsScreen(
            state = state,
            onBackClick = {},
            onToggleLocationInNotifications = {},
            onOpenSystemNotificationsSettings = {},
        )
    }
}

@OptIn(ExperimentalSharedTransitionApi::class)
@Composable
fun NotificationSettings(navigator: Navigator) {
    val vm = koinViewModel<NotificationSettingsViewModel>()
    val state by vm.uiState.collectAsStateWithLifecycle()

    val context = LocalContext.current
    CollectSideEffectWithLifecycle(vm.uiSideEffect) {
        when (it) {
            NotificationSettingsSideEffect.OpenSystemNotificationsSettings -> {
                context.openAppInfoNotificationSettings()
            }
        }
    }

    NotificationSettingsScreen(
        state = state,
        onBackClick = { navigator.goBack() },
        onToggleLocationInNotifications = vm::onToggleLocationInNotifications,
        onOpenSystemNotificationsSettings = vm::openSystemNotificationsSettings,
    )
}

@Composable
fun NotificationSettingsScreen(
    state: Lc<Unit, NotificationSettingsUiState>,
    onBackClick: () -> Unit,
    onToggleLocationInNotifications: (Boolean) -> Unit,
    onOpenSystemNotificationsSettings: () -> Unit,
) {
    ScaffoldWithSmallTopBar(
        appBarTitle = stringResource(id = R.string.settings_notifications),
        navigationIcon = {
            unlessIsDetail { NavigateBackIconButton(onNavigateBack = onBackClick) }
        },
        bottomBar = {
            if (!isTv()) {
                PrimaryButton(
                    modifier =
                        Modifier.windowInsetsPadding(
                                WindowInsets.systemBars.only(WindowInsetsSides.Bottom)
                            )
                            .padding(
                                horizontal = Dimens.sideMargin,
                                vertical = Dimens.screenBottomMargin,
                            ),
                    text = stringResource(R.string.notification_settings),
                    onClick = onOpenSystemNotificationsSettings,
                    trailingIcon = {
                        Icon(
                            imageVector = Icons.AutoMirrored.Rounded.OpenInNew,
                            tint = MaterialTheme.colorScheme.onPrimary,
                            contentDescription = null,
                        )
                    },
                )
            }
        },
    ) { modifier ->
        val scrollState = rememberScrollState()
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier =
                modifier
                    .drawVerticalScrollbar(
                        state = scrollState,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = AlphaScrollbar),
                    )
                    .verticalScroll(state = scrollState)
                    .padding(horizontal = Dimens.sideMarginNew),
        ) {
            when (state) {
                is Lc.Loading -> Loading()
                is Lc.Content -> {
                    NotificationSettingsContent(
                        state = state.value,
                        onToggleLocationInNotifications = onToggleLocationInNotifications,
                    )
                }
            }
        }
    }
}

@Composable
private fun NotificationSettingsContent(
    state: NotificationSettingsUiState,
    onToggleLocationInNotifications: (Boolean) -> Unit,
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        // PSYCO · kicker cyan eyebrow estilo desktop UserInterfaceSettingsView ·
        // sinaliza "alertas no app" sem competir com a switch list abaixo.
        Text(
            text = stringResource(id = R.string.psyco_in_app_alerts),
            style = MaterialTheme.typography.labelSmall,
            fontFamily = GeistMonoFontFamily,
            letterSpacing = 1.6.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier
                .fillMaxWidth()
                .padding(
                    top = Dimens.smallPadding,
                    bottom = Dimens.smallPadding,
                    start = Dimens.smallPadding,
                ),
        )
        SwitchListItem(
            title = stringResource(R.string.enable_location_in_notification),
            isToggled = state.locationInNotificationEnabled,
            onCellClicked = onToggleLocationInNotifications,
        )
    }
}

@Composable
private fun Loading() {
    MullvadCircularProgressIndicatorLarge()
}
