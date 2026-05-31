package vu.vpn.feature.settings.impl

import androidx.activity.compose.BackHandler
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.unit.sp
import vu.vpn.lib.ui.theme.typeface.GeistMonoFontFamily
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewParameter
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.common.compose.assureHasDetailPane
import vu.vpn.common.compose.createUriHook
import vu.vpn.common.compose.isTv
import vu.vpn.common.compose.itemWithDivider
import vu.vpn.common.compose.navigateReplaceIfDetailPane
import vu.vpn.core.Navigator
import vu.vpn.feature.anticensorship.api.AntiCensorshipNavKey
import vu.vpn.feature.apiaccess.api.ApiAccessNavKey
import vu.vpn.feature.appearance.api.AppearanceNavKey
import vu.vpn.feature.appinfo.api.AppInfoNavKey
import vu.vpn.feature.autoconnect.api.AutoConnectNavKey
import vu.vpn.feature.daita.api.DaitaNavKey
import vu.vpn.feature.multihop.api.MultihopNavKey
import vu.vpn.feature.notification.api.NotificationSettingsNavKey
import vu.vpn.feature.problemreport.api.ProblemReportNavKey
import vu.vpn.feature.settings.api.SettingsNavKey
import vu.vpn.feature.splittunneling.api.SplitTunnelingNavKey
import vu.vpn.feature.vpnsettings.api.VpnSettingsNavKey
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.util.appendHideNavOnPlayBuild
import vu.vpn.lib.ui.component.ScaffoldWithSmallTopBar
import vu.vpn.lib.ui.component.button.NavigateCloseIconButton
import vu.vpn.lib.ui.component.drawVerticalScrollbar
import vu.vpn.lib.ui.component.listitem.ExternalLinkListItem
import vu.vpn.lib.ui.component.listitem.NavigationListItem
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorLarge
import vu.vpn.lib.ui.designsystem.Position
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.tag.DAITA_CELL_TEST_TAG
import vu.vpn.lib.ui.tag.LAZY_LIST_TEST_TAG
import vu.vpn.lib.ui.tag.MULTIHOP_CELL_TEST_TAG
import vu.vpn.lib.ui.tag.VPN_SETTINGS_CELL_TEST_TAG
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.theme.color.AlphaScrollbar
import org.koin.androidx.compose.koinViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Preview("Loading|Supported|+")
@Composable
private fun PreviewSettingsScreen(
    @PreviewParameter(SettingsUiStatePreviewParameterProvider::class)
    state: Lc<Unit, SettingsUiState>
) {
    AppTheme {
        SettingsScreen(
            state = state,
            onVpnSettingCellClick = {},
            onSplitTunnelingCellClick = {},
            onAppInfoClick = {},
            onReportProblemCellClick = {},
            onApiAccessClick = {},
            onMultihopClick = {},
            onDaitaClick = {},
            onBackClick = {},
            onNotificationSettingsCellClick = {},
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Settings(navigator: Navigator) {
    val vm = koinViewModel<SettingsViewModel>()
    val state by vm.uiState.collectAsStateWithLifecycle()
    val isTv = isTv()

    BackHandler(enabled = navigator.screenIsListDetailTargetWidth) {
        navigator.goBackUntil(SettingsNavKey, inclusive = true)
    }

    navigator.assureHasDetailPane<SettingsNavKey>(DaitaNavKey())

    SettingsScreen(
        state = state,
        onVpnSettingCellClick =
            dropUnlessResumed {
                if (navigator.screenIsListDetailTargetWidth) {
                    val detailKey = if (isTv) AntiCensorshipNavKey() else AutoConnectNavKey
                    navigator.navigate(VpnSettingsNavKey(), detailKey)
                } else {
                    navigator.navigate(VpnSettingsNavKey())
                }
            },
        onSplitTunnelingCellClick =
            dropUnlessResumed { navigator.navigateReplaceIfDetailPane(SplitTunnelingNavKey()) },
        onAppInfoClick = dropUnlessResumed { navigator.navigateReplaceIfDetailPane(AppInfoNavKey) },
        onApiAccessClick =
            dropUnlessResumed { navigator.navigateReplaceIfDetailPane(ApiAccessNavKey) },
        onReportProblemCellClick =
            dropUnlessResumed { navigator.navigateReplaceIfDetailPane(ProblemReportNavKey) },
        onMultihopClick =
            dropUnlessResumed { navigator.navigateReplaceIfDetailPane(MultihopNavKey()) },
        onDaitaClick = dropUnlessResumed { navigator.navigateReplaceIfDetailPane(DaitaNavKey()) },
        onNotificationSettingsCellClick =
            dropUnlessResumed { navigator.navigateReplaceIfDetailPane(NotificationSettingsNavKey) },
        onAppObfuscationClick =
            dropUnlessResumed { navigator.navigateReplaceIfDetailPane(AppearanceNavKey) },
        onBackClick = dropUnlessResumed { navigator.goBackUntil(SettingsNavKey, inclusive = true) },
    )
}

@Composable
fun SettingsScreen(
    state: Lc<Unit, SettingsUiState>,
    onVpnSettingCellClick: () -> Unit,
    onSplitTunnelingCellClick: () -> Unit,
    onAppInfoClick: () -> Unit,
    onReportProblemCellClick: () -> Unit,
    onApiAccessClick: () -> Unit,
    onMultihopClick: () -> Unit,
    onDaitaClick: () -> Unit,
    onBackClick: () -> Unit,
    onNotificationSettingsCellClick: () -> Unit,
    onAppObfuscationClick: () -> Unit = {},
) {
    ScaffoldWithSmallTopBar(
        appBarTitle = "Configurações",
        navigationIcon = { NavigateCloseIconButton(onBackClick) },
    ) { modifier ->
        val lazyListState = rememberLazyListState()
        LazyColumn(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier =
                modifier
                    .drawVerticalScrollbar(
                        state = lazyListState,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = AlphaScrollbar),
                    )
                    .testTag(LAZY_LIST_TEST_TAG)
                    .padding(horizontal = Dimens.sideMarginNew)
                    .animateContentSize(),
            state = lazyListState,
        ) {
            when (state) {
                is Lc.Loading -> loading()
                is Lc.Content -> {
                    content(
                        state = state.value,
                        onVpnSettingCellClick = onVpnSettingCellClick,
                        onSplitTunnelingCellClick = onSplitTunnelingCellClick,
                        onAppInfoClick = onAppInfoClick,
                        onReportProblemCellClick = onReportProblemCellClick,
                        onApiAccessClick = onApiAccessClick,
                        onMultihopClick = onMultihopClick,
                        onDaitaClick = onDaitaClick,
                        onNotificationSettingsCellClick = onNotificationSettingsCellClick,
                        onAppObfuscationClick = onAppObfuscationClick,
                    )
                }
            }
        }
    }
}

private fun LazyListScope.content(
    state: SettingsUiState,
    onVpnSettingCellClick: () -> Unit,
    onSplitTunnelingCellClick: () -> Unit,
    onAppInfoClick: () -> Unit,
    onReportProblemCellClick: () -> Unit,
    onApiAccessClick: () -> Unit,
    onMultihopClick: () -> Unit,
    onDaitaClick: () -> Unit,
    onNotificationSettingsCellClick: () -> Unit,
    onAppObfuscationClick: () -> Unit = {},
) {
    if (state.isLoggedIn) {
        item { SectionKicker(stringResource(id = R.string.psyco_connection)) }
        itemWithDivider {
            DaitaListItem(isDaitaEnabled = state.isDaitaEnabled, onDaitaClick = onDaitaClick)
        }
        itemWithDivider {
            MultihopCell(
                isMultihopEnabled = state.multihopEnabled,
                onMultihopClick = onMultihopClick,
            )
        }
        itemWithDivider {
            NavigationListItem(
                title = stringResource(id = R.string.settings_vpn),
                onClick = onVpnSettingCellClick,
                testTag = VPN_SETTINGS_CELL_TEST_TAG,
                position = Position.Bottom,
            )
        }
        item { Spacer(modifier = Modifier.height(Dimens.cellVerticalSpacing)) }
        item { SectionKicker(stringResource(id = R.string.psyco_split_tunneling_kicker)) }
        item { SplitTunneling(onSplitTunnelingCellClick) }
        item { Spacer(modifier = Modifier.height(Dimens.cellVerticalSpacing)) }
    }

    item { SectionKicker(stringResource(id = R.string.psyco_advanced)) }
    item {
        NavigationListItem(
            title = stringResource(id = R.string.settings_api_access),
            onClick = onApiAccessClick,
        )
    }

    item { Spacer(modifier = Modifier.height(Dimens.cellVerticalSpacing)) }

    item { SectionKicker(stringResource(id = R.string.psyco_appearance_alerts)) }
    itemWithDivider {
        NavigationListItem(
            title = stringResource(id = R.string.appearance),
            onClick = onAppObfuscationClick,
            position = Position.Top,
        )
    }

    itemWithDivider {
        NavigationListItem(
            title = stringResource(id = R.string.settings_notifications),
            onClick = onNotificationSettingsCellClick,
            position = Position.Middle,
        )
    }

    item { AppInfo(onAppInfoClick, state) }

    item { Spacer(modifier = Modifier.height(Dimens.cellVerticalSpacing)) }

    itemWithDivider { ReportProblem(onReportProblemCellClick) }

    if (!state.isPlayBuild) {
        itemWithDivider { FaqAndGuides() }
    }

    itemWithDivider { PrivacyPolicy(state) }

    item { Spacer(modifier = Modifier.height(Dimens.cellVerticalSpacing)) }
}

@Composable
private fun SplitTunneling(onSplitTunnelingCellClick: () -> Unit) {
    NavigationListItem(
        title = stringResource(id = R.string.psyco_split_tunneling),
        onClick = onSplitTunnelingCellClick,
    )
}

@Composable
private fun AppInfo(navigateToAppInfo: () -> Unit, state: SettingsUiState) {
    NavigationListItem(
        title = stringResource(id = R.string.psyco_about_app),
        subtitle = state.appVersion,
        subTitleTextDirection = TextDirection.Ltr,
        showWarning = !state.isSupportedVersion,
        position = Position.Bottom,
        onClick = navigateToAppInfo,
    )
}

@Composable
private fun ReportProblem(onReportProblemCellClick: () -> Unit) {
    NavigationListItem(
        title = stringResource(id = R.string.report_a_problem),
        onClick = { onReportProblemCellClick() },
        position = Position.Top,
    )
}

@Composable
private fun FaqAndGuides() {
    val faqGuideLabel = "FAQ e guias"
    val openFaqAndGuides =
        LocalUriHandler.current.createUriHook(stringResource(R.string.faqs_and_guides_url))

    ExternalLinkListItem(
        title = faqGuideLabel,
        onClick = openFaqAndGuides,
        position = Position.Middle,
    )
}

@Composable
private fun PrivacyPolicy(state: SettingsUiState) {
    val privacyPolicyLabel = "Política de privacidade"

    val openPrivacyPolicy =
        LocalUriHandler.current.createUriHook(
            stringResource(R.string.privacy_policy_url).appendHideNavOnPlayBuild(state.isPlayBuild)
        )

    ExternalLinkListItem(
        title = privacyPolicyLabel,
        onClick = openPrivacyPolicy,
        position = Position.Bottom,
    )
}

@Composable
private fun DaitaListItem(isDaitaEnabled: Boolean, onDaitaClick: () -> Unit) {
    NavigationListItem(
        title = "DAITA",
        subtitle = if (isDaitaEnabled) "Ligado" else "Desligado",
        onClick = onDaitaClick,
        position = Position.Top,
        testTag = DAITA_CELL_TEST_TAG,
    )
}

@Composable
private fun MultihopCell(isMultihopEnabled: Boolean, onMultihopClick: () -> Unit) {
    NavigationListItem(
        title = "Multihop",
        subtitle = if (isMultihopEnabled) "Ligado" else "Desligado",
        onClick = onMultihopClick,
        position = Position.Middle,
        testTag = MULTIHOP_CELL_TEST_TAG,
    )
}

private fun LazyListScope.loading() {
    item { MullvadCircularProgressIndicatorLarge() }
}

/**
 * PSYCO · kicker eyebrow cyan uppercase agrupando seções do Settings ·
 * porta o `StyledSettingsKicker` do desktop SettingsView. Caps + cor brand
 * sinaliza "section header" sem competir visualmente com os itens da lista.
 */
@Composable
private fun SectionKicker(label: String) {
    Text(
        text = label.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        fontFamily = GeistMonoFontFamily,
        letterSpacing = 1.6.sp,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier
            .fillMaxWidth()
            .padding(
                top = Dimens.smallPadding,
                bottom = Dimens.miniPadding,
                start = Dimens.smallPadding,
            ),
    )
}
