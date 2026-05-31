package vu.vpn.feature.anticensorship.impl

import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewParameter
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.common.compose.itemWithDivider
import vu.vpn.common.compose.unlessIsDetail
import vu.vpn.core.Navigator
import vu.vpn.feature.anticensorship.api.AntiCensorshipNavKey
import vu.vpn.feature.anticensorship.api.SelectPortNavKey
import vu.vpn.lib.common.Lc
import vu.vpn.lib.model.ObfuscationMode
import vu.vpn.lib.model.PortType
import vu.vpn.lib.ui.component.ScaffoldWithSmallTopBar
import vu.vpn.lib.ui.component.annotatedStringResource
import vu.vpn.lib.ui.component.button.NavigateBackIconButton
import vu.vpn.lib.ui.component.button.NavigateCloseIconButton
import vu.vpn.lib.ui.component.drawVerticalScrollbar
import vu.vpn.lib.ui.component.listitem.InfoListItem
import vu.vpn.lib.ui.component.listitem.ObfuscationModeListItem
import vu.vpn.lib.ui.component.listitem.SelectableListItem
import vu.vpn.lib.ui.component.text.ScreenDescription
import vu.vpn.lib.ui.designsystem.Hierarchy
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorLarge
import vu.vpn.lib.ui.designsystem.Position
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.tag.LAZY_LIST_ANTI_CENSORSHIP_SETTINGS_TEST_TAG
import vu.vpn.lib.ui.tag.WIREGUARD_OBFUSCATION_LWO_CELL_TEST_TAG
import vu.vpn.lib.ui.tag.WIREGUARD_OBFUSCATION_OFF_CELL_TEST_TAG
import vu.vpn.lib.ui.tag.WIREGUARD_OBFUSCATION_QUIC_CELL_TEST_TAG
import vu.vpn.lib.ui.tag.WIREGUARD_OBFUSCATION_SHADOWSOCKS_CELL_TEST_TAG
import vu.vpn.lib.ui.tag.WIREGUARD_OBFUSCATION_UDP_OVER_TCP_CELL_TEST_TAG
import vu.vpn.lib.ui.tag.WIREGUARD_OBFUSCATION_WG_PORT_TEST_TAG
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.theme.color.AlphaScrollbar
import vu.vpn.lib.ui.util.applyIfNotNull
import org.koin.androidx.compose.koinViewModel
import org.koin.core.parameter.parametersOf

@Preview("Udp2Tcp|Loading")
@Composable
private fun PreviewAntiCensorshipSettingsScreen(
    @PreviewParameter(AntiCensorshipUiStatePreviewParameterProvider::class)
    state: Lc<Unit, AntiCensorshipSettingsUiState>
) {
    AppTheme {
        AntiCensorshipSettingsScreen(
            state = state,
            navigateToShadowSocksSettings = {},
            navigateToUdp2TcpSettings = {},
            onBackClick = {},
            onSelectObfuscationMode = {},
            navigateToWireguardPortSettings = {},
            navigateToLwoPortSettings = {},
        )
    }
}

@Composable
fun SharedTransitionScope.AntiCensorshipSettings(
    navigator: Navigator,
    navArgs: AntiCensorshipNavKey,
    animatedVisibilityScope: AnimatedVisibilityScope,
) {
    val viewModel = koinViewModel<AntiCensorshipSettingsViewModel> { parametersOf(navArgs.isModal) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    AntiCensorshipSettingsScreen(
        modifier =
            Modifier.applyIfNotNull(navArgs.selectedFeature) {
                sharedBounds(
                    rememberSharedContentState(key = it),
                    animatedVisibilityScope = animatedVisibilityScope,
                )
            },
        state = state,
        navigateToShadowSocksSettings =
            dropUnlessResumed { navigator.navigate(SelectPortNavKey(PortType.Shadowsocks)) },
        navigateToUdp2TcpSettings =
            dropUnlessResumed { navigator.navigate(SelectPortNavKey(PortType.Udp2Tcp)) },
        navigateToWireguardPortSettings =
            dropUnlessResumed { navigator.navigate(SelectPortNavKey(PortType.Wireguard)) },
        navigateToLwoPortSettings =
            dropUnlessResumed { navigator.navigate(SelectPortNavKey(PortType.Lwo)) },
        onBackClick = dropUnlessResumed { navigator.goBack() },
        onSelectObfuscationMode = viewModel::onSelectObfuscationMode,
    )
}

@Composable
fun AntiCensorshipSettingsScreen(
    modifier: Modifier = Modifier,
    state: Lc<Unit, AntiCensorshipSettingsUiState>,
    navigateToShadowSocksSettings: () -> Unit,
    navigateToUdp2TcpSettings: () -> Unit,
    navigateToWireguardPortSettings: () -> Unit,
    navigateToLwoPortSettings: () -> Unit,
    onBackClick: () -> Unit,
    onSelectObfuscationMode: (obfuscationMode: ObfuscationMode) -> Unit,
) {
    ScaffoldWithSmallTopBar(
        modifier = modifier,
        appBarTitle = stringResource(id = R.string.anti_censorship),
        navigationIcon = {
            if (state.contentOrNull()?.isModal == true) {
                NavigateCloseIconButton(onBackClick)
            } else {
                unlessIsDetail { NavigateBackIconButton(onNavigateBack = onBackClick) }
            }
        },
    ) { modifier ->
        val lazyListState: LazyListState = rememberLazyListState()
        LazyColumn(
            modifier =
                modifier
                    .drawVerticalScrollbar(
                        state = lazyListState,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = AlphaScrollbar),
                    )
                    .testTag(LAZY_LIST_ANTI_CENSORSHIP_SETTINGS_TEST_TAG)
                    .padding(horizontal = Dimens.sideMarginNew),
            horizontalAlignment = Alignment.CenterHorizontally,
            state = lazyListState,
        ) {
            when (state) {
                is Lc.Loading -> loading()
                is Lc.Content ->
                    content(
                        state = state.value,
                        navigateToShadowSocksSettings = navigateToShadowSocksSettings,
                        navigateToUdp2TcpSettings = navigateToUdp2TcpSettings,
                        onSelectObfuscationMode = onSelectObfuscationMode,
                        navigateToWireguardPortSettings = navigateToWireguardPortSettings,
                        navigateToLwoPortSettings = navigateToLwoPortSettings,
                    )
            }
        }
    }
}

@Suppress("LongMethod")
private fun LazyListScope.content(
    state: AntiCensorshipSettingsUiState,
    navigateToShadowSocksSettings: () -> Unit,
    navigateToUdp2TcpSettings: () -> Unit,
    navigateToWireguardPortSettings: () -> Unit,
    navigateToLwoPortSettings: () -> Unit,
    onSelectObfuscationMode: (obfuscationMode: ObfuscationMode) -> Unit,
) {
    item {
        Column {
            ScreenDescription(stringResource(R.string.anti_censorship_info_first_paragraph) + "\n")
            ScreenDescription(
                annotatedStringResource(R.string.anti_censorship_info_second_paragraph),
                modifier = Modifier.padding(bottom = Dimens.mediumPadding),
            )
        }
    }
    itemWithDivider {
        InfoListItem(position = Position.Top, title = stringResource(R.string.method))
    }
    state.items.forEach {
        when (it) {
            is ObfuscationSettingItem.Obfuscation.Automatic ->
                item(key = it::class.simpleName) {
                    SelectableListItem(
                        hierarchy = Hierarchy.Child1,
                        position = Position.Middle,
                        title = stringResource(id = R.string.automatic),
                        isSelected = it.selected,
                        onClick = { onSelectObfuscationMode(ObfuscationMode.Auto) },
                    )
                }
            is ObfuscationSettingItem.Obfuscation.WireguardPort ->
                item(key = it::class.simpleName) {
                    ObfuscationModeListItem(
                        hierarchy = Hierarchy.Child1,
                        position = Position.Middle,
                        obfuscationMode = ObfuscationMode.WireguardPort,
                        isSelected = it.selected,
                        port = it.port,
                        onSelected = { onSelectObfuscationMode(ObfuscationMode.WireguardPort) },
                        onNavigate = navigateToWireguardPortSettings,
                        testTag = WIREGUARD_OBFUSCATION_WG_PORT_TEST_TAG,
                    )
                }
            is ObfuscationSettingItem.Obfuscation.Lwo ->
                item(key = it::class.simpleName) {
                    ObfuscationModeListItem(
                        hierarchy = Hierarchy.Child1,
                        position = Position.Middle,
                        obfuscationMode = ObfuscationMode.Lwo,
                        isSelected = it.selected,
                        port = it.port,
                        onSelected = { onSelectObfuscationMode(ObfuscationMode.Lwo) },
                        onNavigate = navigateToLwoPortSettings,
                        testTag = WIREGUARD_OBFUSCATION_LWO_CELL_TEST_TAG,
                    )
                }
            is ObfuscationSettingItem.Obfuscation.Quic ->
                item(key = it::class.simpleName) {
                    SelectableListItem(
                        hierarchy = Hierarchy.Child1,
                        position = Position.Middle,
                        title = stringResource(id = R.string.quic),
                        isSelected = it.selected,
                        onClick = { onSelectObfuscationMode(ObfuscationMode.Quic) },
                        testTag = WIREGUARD_OBFUSCATION_QUIC_CELL_TEST_TAG,
                    )
                }
            is ObfuscationSettingItem.Obfuscation.Shadowsocks ->
                item(key = it::class.simpleName) {
                    ObfuscationModeListItem(
                        hierarchy = Hierarchy.Child1,
                        position = Position.Middle,
                        obfuscationMode = ObfuscationMode.Shadowsocks,
                        isSelected = it.selected,
                        port = it.port,
                        onSelected = { onSelectObfuscationMode(ObfuscationMode.Shadowsocks) },
                        onNavigate = navigateToShadowSocksSettings,
                        testTag = WIREGUARD_OBFUSCATION_SHADOWSOCKS_CELL_TEST_TAG,
                    )
                }

            is ObfuscationSettingItem.Obfuscation.UdpOverTcp ->
                item(key = it::class.simpleName) {
                    ObfuscationModeListItem(
                        hierarchy = Hierarchy.Child1,
                        position = Position.Middle,
                        obfuscationMode = ObfuscationMode.Udp2Tcp,
                        isSelected = it.selected,
                        port = it.port,
                        onSelected = { onSelectObfuscationMode(ObfuscationMode.Udp2Tcp) },
                        onNavigate = navigateToUdp2TcpSettings,
                        testTag = WIREGUARD_OBFUSCATION_UDP_OVER_TCP_CELL_TEST_TAG,
                    )
                }
            is ObfuscationSettingItem.Obfuscation.Off ->
                item(key = it::class.simpleName) {
                    SelectableListItem(
                        hierarchy = Hierarchy.Child1,
                        position = Position.Bottom,
                        title = stringResource(id = R.string.none),
                        isSelected = it.selected,
                        onClick = { onSelectObfuscationMode(ObfuscationMode.Off) },
                        testTag = WIREGUARD_OBFUSCATION_OFF_CELL_TEST_TAG,
                    )
                }
            ObfuscationSettingItem.Divider -> {
                item(contentType = it::class.simpleName) {
                    HorizontalDivider(color = Color.Transparent)
                }
            }
        }
    }
    item { Spacer(Modifier.height(Dimens.screenBottomMarginNew)) }
}

private fun LazyListScope.loading() {
    item { MullvadCircularProgressIndicatorLarge() }
}
