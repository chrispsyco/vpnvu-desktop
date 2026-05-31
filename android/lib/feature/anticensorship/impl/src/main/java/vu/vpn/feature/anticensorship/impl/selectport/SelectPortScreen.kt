package vu.vpn.feature.anticensorship.impl.selectport

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewParameter
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.common.compose.dropUnlessResumed
import vu.vpn.common.compose.itemWithDivider
import vu.vpn.common.compose.unlessIsDetail
import vu.vpn.core.LocalResultStore
import vu.vpn.core.Navigator
import vu.vpn.feature.anticensorship.api.CustomPortNavKey
import vu.vpn.feature.anticensorship.api.CustomPortNavResult
import vu.vpn.feature.anticensorship.api.SelectPortNavKey
import vu.vpn.lib.common.Lc
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.Port
import vu.vpn.lib.ui.component.ScaffoldWithSmallTopBar
import vu.vpn.lib.ui.component.button.NavigateBackIconButton
import vu.vpn.lib.ui.component.drawVerticalScrollbar
import vu.vpn.lib.ui.component.listitem.CustomPortListItem
import vu.vpn.lib.ui.component.listitem.InfoListItem
import vu.vpn.lib.ui.component.listitem.SelectableListItem
import vu.vpn.lib.ui.designsystem.Hierarchy
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorLarge
import vu.vpn.lib.ui.designsystem.Position
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.tag.SELECT_PORT_CUSTOM_TEST_TAG
import vu.vpn.lib.ui.tag.SELECT_PORT_ITEM_AUTOMATIC_TEST_TAG
import vu.vpn.lib.ui.tag.SELECT_PORT_ITEM_X_TEST_TAG
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.theme.color.AlphaScrollbar
import org.koin.androidx.compose.koinViewModel
import org.koin.core.parameter.parametersOf

@Preview("Loading|Automatic|80")
@Composable
private fun PreviewSelectPortScreen(
    @PreviewParameter(SelectPortUiStatePreviewParameterProvider::class)
    state: Lc<Unit, SelectPortUiState>
) {
    AppTheme {
        SelectPortScreen(
            state = state,
            onObfuscationPortSelected = {},
            onBackClick = {},
            navigateToCustomPortDialog = {},
        )
    }
}

@Composable
fun SelectPort(navArgs: SelectPortNavKey, navigator: Navigator) {
    val viewModel = koinViewModel<SelectPortViewModel> { parametersOf(navArgs) }
    val stateLc by viewModel.uiState.collectAsStateWithLifecycle()

    LocalResultStore.current.consumeResult<CustomPortNavResult> { result ->
        val port = result.port
        if (port != null) {
            viewModel.onPortSelected(Constraint.Only(port))
        } else {
            viewModel.resetCustomPort()
        }
    }

    SelectPortScreen(
        state = stateLc,
        onObfuscationPortSelected = viewModel::onPortSelected,
        navigateToCustomPortDialog =
            dropUnlessResumed { customPort ->
                val state = stateLc.contentOrNull() ?: return@dropUnlessResumed

                navigator.navigate(
                    CustomPortNavKey(
                        portType = state.portType,
                        allowedPortRanges = state.allowedPortRanges,
                        recommendedPortRanges = state.recommendedPortRanges,
                        customPort = customPort,
                    )
                )
            },
        onBackClick = dropUnlessResumed { navigator.goBack() },
    )
}

@Composable
fun SelectPortScreen(
    state: Lc<Unit, SelectPortUiState>,
    onObfuscationPortSelected: (Constraint<Port>) -> Unit,
    navigateToCustomPortDialog: (Port?) -> Unit,
    onBackClick: () -> Unit,
) {

    ScaffoldWithSmallTopBar(
        appBarTitle = state.contentOrNull()?.title ?: "",
        navigationIcon = { unlessIsDetail { NavigateBackIconButton(onNavigateBack = onBackClick) } },
    ) { modifier ->
        val lazyListState: LazyListState = rememberLazyListState()
        LazyColumn(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier =
                modifier
                    .drawVerticalScrollbar(
                        state = lazyListState,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = AlphaScrollbar),
                    )
                    .padding(horizontal = Dimens.sideMarginNew),
            state = lazyListState,
        ) {
            when (state) {
                is Lc.Loading -> loading()
                is Lc.Content ->
                    content(
                        state = state.value,
                        onObfuscationPortSelected = onObfuscationPortSelected,
                        navigateToCustomPortDialog = navigateToCustomPortDialog,
                    )
            }
        }
    }
}

private fun LazyListScope.content(
    state: SelectPortUiState,
    onObfuscationPortSelected: (Constraint<Port>) -> Unit,
    navigateToCustomPortDialog: (Port?) -> Unit,
) {
    itemWithDivider { InfoListItem(position = Position.Top, title = stringResource(R.string.port)) }
    itemWithDivider {
        SelectableListItem(
            hierarchy = Hierarchy.Child1,
            position =
                if (state.customPortEnabled || state.presetPorts.isNotEmpty()) Position.Middle
                else Position.Bottom,
            title = stringResource(id = R.string.automatic),
            isSelected = state.port is Constraint.Any,
            onClick = { onObfuscationPortSelected(Constraint.Any) },
            testTag = SELECT_PORT_ITEM_AUTOMATIC_TEST_TAG,
        )
    }
    state.presetPorts.forEachIndexed { index, port ->
        itemWithDivider {
            SelectableListItem(
                hierarchy = Hierarchy.Child1,
                position =
                    if (state.customPortEnabled || index != state.presetPorts.lastIndex)
                        Position.Middle
                    else Position.Bottom,
                title = port.toString(),
                isSelected = state.port.getOrNull() == port,
                onClick = { onObfuscationPortSelected(Constraint.Only(port)) },
                testTag = SELECT_PORT_ITEM_X_TEST_TAG.format(port.value),
            )
        }
    }
    if (state.customPortEnabled) {
        itemWithDivider {
            CustomPortListItem(
                hierarchy = Hierarchy.Child1,
                position = Position.Bottom,
                title = stringResource(id = R.string.wireguard_custon_port_title),
                isSelected = state.isCustom,
                port = state.customPort,
                onMainCellClicked = {
                    if (state.customPort != null) {
                        onObfuscationPortSelected(Constraint.Only(state.customPort))
                    } else {
                        navigateToCustomPortDialog(null)
                    }
                },
                onPortCellClicked = { navigateToCustomPortDialog(state.customPort) },
                mainTestTag = SELECT_PORT_CUSTOM_TEST_TAG,
            )
        }
    }
}

private fun LazyListScope.loading() {
    item { MullvadCircularProgressIndicatorLarge() }
}
