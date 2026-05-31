package vu.vpn.feature.appinfo.impl

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.unit.sp
import vu.vpn.lib.ui.theme.typeface.GeistMonoFontFamily
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewParameter
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.common.compose.CollectSideEffectWithLifecycle
import vu.vpn.common.compose.safeOpenUri
import vu.vpn.common.compose.showSnackbarImmediately
import vu.vpn.common.compose.unlessIsDetail
import vu.vpn.core.Navigator
import vu.vpn.feature.appinfo.api.ChangelogNavKey
import vu.vpn.lib.common.Lc
import vu.vpn.lib.ui.component.ScaffoldWithSmallTopBar
import vu.vpn.lib.ui.component.button.NavigateBackIconButton
import vu.vpn.lib.ui.component.drawVerticalScrollbar
import vu.vpn.lib.ui.component.listitem.ExternalLinkListItem
import vu.vpn.lib.ui.component.listitem.NavigationListItem
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorLarge
import vu.vpn.lib.ui.designsystem.Position
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.theme.color.AlphaScrollbar
import org.koin.androidx.compose.koinViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Preview("Loading|Supported|Unsupported")
@Composable
private fun PreviewAppInfoScreen(
    @PreviewParameter(AppInfoUiStatePreviewParameterProvider::class) state: Lc<Unit, AppInfoUiState>
) {
    AppTheme {
        AppInfo(
            state = state,
            snackbarHostState = SnackbarHostState(),
            onBackClick = {},
            navigateToChangelog = {},
            openAppListing = {},
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppInfo(navigator: Navigator) {
    val vm = koinViewModel<AppInfoViewModel>()
    val state by vm.uiState.collectAsStateWithLifecycle()

    val uriHandler = LocalUriHandler.current
    val snackbarHostState = remember { SnackbarHostState() }

    CollectSideEffectWithLifecycle(vm.uiSideEffect) { sideEffect ->
        when (sideEffect) {
            is AppInfoSideEffect.OpenUri -> {
                uriHandler.safeOpenUri(sideEffect.uri.toString()).onLeft {
                    snackbarHostState.showSnackbarImmediately(message = sideEffect.errorMessage)
                }
            }
        }
    }

    AppInfo(
        state = state,
        snackbarHostState = snackbarHostState,
        onBackClick = dropUnlessResumed { navigator.goBack() },
        navigateToChangelog = dropUnlessResumed { navigator.navigate(ChangelogNavKey()) },
        openAppListing = dropUnlessResumed { vm.openAppListing() },
    )
}

@ExperimentalMaterial3Api
@Composable
fun AppInfo(
    state: Lc<Unit, AppInfoUiState>,
    snackbarHostState: SnackbarHostState,
    onBackClick: () -> Unit,
    navigateToChangelog: () -> Unit,
    openAppListing: () -> Unit,
) {
    ScaffoldWithSmallTopBar(
        appBarTitle = "Sobre o app",
        navigationIcon = {
            unlessIsDetail { NavigateBackIconButton(onNavigateBack = onBackClick) }
        },
        snackbarHostState = snackbarHostState,
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
                    .animateContentSize()
                    .padding(horizontal = Dimens.sideMarginNew),
        ) {
            when (state) {
                is Lc.Loading -> Loading()
                is Lc.Content ->
                    AppInfoContent(
                        state = state.value,
                        navigateToChangelog = navigateToChangelog,
                        openAppListing = openAppListing,
                    )
            }
        }
    }
}

@Composable
private fun AppInfoContent(
    state: AppInfoUiState,
    navigateToChangelog: () -> Unit,
    openAppListing: () -> Unit,
) {
    Column(modifier = Modifier.padding(bottom = Dimens.smallPadding).animateContentSize()) {
        // PSYCO · hero VPN.vu · porta do desktop AppInfoView · brand bloco
        // cyan + tagline (YOUR VPN · NO NAME, NO TRACES) + version chip.
        AppInfoBrandHero(state)

        // PSYCO · kicker cyan acima do bloco "Versão" + Changelog · separa
        // visualmente o hero brand do funcional.
        Text(
            text = "VERSÃO & NOVIDADES",
            style = MaterialTheme.typography.labelSmall,
            fontFamily = GeistMonoFontFamily,
            letterSpacing = 1.6.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(
                top = Dimens.mediumPadding,
                bottom = Dimens.smallPadding,
                start = Dimens.smallPadding,
            ),
        )

        ChangelogRow(navigateToChangelog)
        HorizontalDivider()
        AppVersionRow(state, openAppListing)
    }
}

@Composable
private fun AppInfoBrandHero(state: AppInfoUiState) {
    androidx.compose.foundation.layout.Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = Dimens.mediumPadding, bottom = Dimens.smallPadding),
        contentAlignment = androidx.compose.ui.Alignment.Center,
    ) {
        Column(
            horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally,
        ) {
            Text(
                text = "VPN.vu",
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Text(
                text = "YOUR VPN · NO NAME, NO TRACES",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(top = Dimens.miniPadding),
            )
            Text(
                text = "v${state.version.currentVersion}",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = Dimens.smallPadding),
            )
        }
    }
}

@Composable
private fun AppVersionRow(state: AppInfoUiState, openAppListing: () -> Unit) {
    Column {
        ExternalLinkListItem(
            title = "Versão",
            subtitle = state.version.currentVersion,
            subTitleTextDirection = TextDirection.Ltr,
            showWarning = !state.version.isSupported,
            position = Position.Bottom,
            onClick = openAppListing,
        )

        if (!state.version.isSupported) {
            Text(
                text =
                    "Sua privacidade pode estar em risco com esta versão não suportada do app. " +
                        "Atualize agora.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier =
                    Modifier.fillMaxWidth()
                        .padding(
                            start = Dimens.cellStartPadding,
                            end = Dimens.cellStartPadding,
                            top = Dimens.smallPadding,
                            bottom = Dimens.mediumPadding,
                        ),
            )
        }
    }
}

@Composable
private fun ChangelogRow(navigateToChangelog: () -> Unit) {
    NavigationListItem(
        title = "Novidades",
        onClick = navigateToChangelog,
        position = Position.Top,
    )
}

@Composable
private fun Loading() {
    MullvadCircularProgressIndicatorLarge()
}
