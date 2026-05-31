@file:OptIn(ExperimentalSharedTransitionApi::class)

package vu.vpn.feature.multihop.impl

import androidx.compose.ui.res.stringResource

import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.ExperimentalSharedTransitionApi
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewParameter
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.common.compose.unlessIsDetail
import vu.vpn.core.Navigator
import vu.vpn.feature.location.api.SelectLocationNavKey
import vu.vpn.lib.common.Lc
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.FeatureIndicator
import vu.vpn.lib.model.MultihopRelayListType
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.ui.component.ScaffoldWithSmallTopBar
import vu.vpn.lib.ui.component.button.NavigateBackIconButton
import vu.vpn.lib.ui.component.button.NavigateCloseIconButton
import vu.vpn.lib.ui.component.drawVerticalScrollbar
import vu.vpn.lib.ui.component.listitem.NavigationListItem
import vu.vpn.lib.ui.component.listitem.SwitchListItem
import vu.vpn.lib.ui.component.text.ScreenDescription
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorLarge
import vu.vpn.lib.ui.designsystem.Position
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.tag.MULTIHOP_SCREEN_TEST_TAG
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.theme.color.AlphaScrollbar
import vu.vpn.lib.ui.theme.typeface.GeistMonoFontFamily
import org.koin.androidx.compose.koinViewModel
import org.koin.core.parameter.parametersOf

@Preview("Loading|Enabled|Disabled")
@Composable
private fun PreviewMultihopScreen(
    @PreviewParameter(MultihopUiStatePreviewParameterProvider::class)
    state: Lc<Boolean, MultihopUiState>
) {
    AppTheme { MultihopScreen(state = state, onMultihopClick = {}, onBackClick = {}) }
}

@Composable
fun SharedTransitionScope.Multihop(
    isModal: Boolean,
    navigator: Navigator,
    animatedVisibilityScope: AnimatedVisibilityScope,
) {
    val viewModel = koinViewModel<MultihopViewModel>() { parametersOf(isModal) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    MultihopScreen(
        state = state,
        modifier =
            Modifier.testTag(MULTIHOP_SCREEN_TEST_TAG)
                .sharedBounds(
                    rememberSharedContentState(key = FeatureIndicator.MULTIHOP),
                    animatedVisibilityScope = animatedVisibilityScope,
                ),
        onMultihopClick = viewModel::setMultihop,
        onBackClick = dropUnlessResumed { navigator.goBack() },
        onEntryClick =
            dropUnlessResumed {
                navigator.navigate(SelectLocationNavKey(MultihopRelayListType.ENTRY))
            },
        onExitClick =
            dropUnlessResumed {
                navigator.navigate(SelectLocationNavKey(MultihopRelayListType.EXIT))
            },
    )
}

@Composable
fun MultihopScreen(
    state: Lc<Boolean, MultihopUiState>,
    onMultihopClick: (enable: Boolean) -> Unit,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier,
    onEntryClick: () -> Unit = {},
    onExitClick: () -> Unit = {},
) {
    ScaffoldWithSmallTopBar(
        modifier = modifier,
        appBarTitle = "Multihop",
        navigationIcon = {
            if (state.isModal()) {
                NavigateCloseIconButton(onBackClick)
            } else {
                unlessIsDetail { NavigateBackIconButton(onNavigateBack = onBackClick) }
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
                    MultihopContent(
                        state = state.value,
                        onMultihopClick = onMultihopClick,
                        onEntryClick = onEntryClick,
                        onExitClick = onExitClick,
                    )
                }
            }
        }
    }
}

@Composable
private fun ColumnScope.MultihopContent(
    state: MultihopUiState,
    onMultihopClick: (enable: Boolean) -> Unit,
    onEntryClick: () -> Unit,
    onExitClick: () -> Unit,
) {
    // Scale image to fit width up to certain width
    Image(
        contentScale = ContentScale.FillWidth,
        modifier =
            Modifier.widthIn(max = Dimens.settingsDetailsImageMaxWidth)
                .fillMaxWidth()
                .align(Alignment.CenterHorizontally),
        painter = painterResource(id = R.drawable.multihop_illustration),
        contentDescription = "Multihop",
    )
    Description()
    SwitchListItem(
        title = stringResource(id = R.string.psyco_enable_multihop),
        isToggled = state.enable,
        onCellClicked = onMultihopClick,
    )

    // PSYCO · seção stringResource(id = R.string.psyco_servers) do Figma · entry/exit selecionados, cada linha
    // abre o seletor de localização já na aba certa. Só faz sentido com multihop on.
    if (state.enable) {
        SectionKicker(stringResource(id = R.string.psyco_servers))
        NavigationListItem(
            title = stringResource(id = R.string.psyco_entry),
            subtitle = state.entry.toDisplayName(),
            position = Position.Top,
            onClick = onEntryClick,
        )
        NavigationListItem(
            title = stringResource(id = R.string.exit),
            subtitle = state.exit.toDisplayName(),
            position = Position.Bottom,
            onClick = onExitClick,
        )
    }
}

@Composable
private fun Description() {
    ScreenDescription(
        modifier = Modifier.padding(vertical = Dimens.mediumPadding),
        text =
            "Adiciona um servidor de entrada antes do servidor de saída. " +
                "Maior privacidade, latência um pouco maior.",
    )
}

// PSYCO · resolve o relay selecionado pra um nome legível (espelha o
// toDisplayName do SelectLocation, mas em PT-BR e local ao módulo).
private fun Constraint<RelayItem>?.toDisplayName(): String =
    when (this) {
        Constraint.Any -> "Automático"
        is Constraint.Only<RelayItem> -> value.name
        null -> "Indisponível"
    }

// PSYCO · section-label cinza-mono (Geist Mono) batendo o .mv-section-title do Figma.
@Composable
private fun SectionKicker(label: String) {
    Text(
        text = label.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        fontFamily = GeistMonoFontFamily,
        letterSpacing = 1.6.sp,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier =
            Modifier.fillMaxWidth()
                .padding(
                    top = Dimens.mediumPadding,
                    bottom = Dimens.smallPadding,
                    start = Dimens.smallPadding,
                ),
    )
}

@Composable
private fun Loading() {
    MullvadCircularProgressIndicatorLarge()
}

private fun Lc<Boolean, MultihopUiState>.isModal(): Boolean =
    when (this) {
        is Lc.Loading -> this.value
        is Lc.Content -> this.value.isModal
    }
