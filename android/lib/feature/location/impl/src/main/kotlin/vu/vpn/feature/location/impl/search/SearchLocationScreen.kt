package vu.vpn.feature.location.impl.search

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.unit.sp
import vu.vpn.lib.ui.theme.typeface.GeistMonoFontFamily
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.platform.LocalResources
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewParameter
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import kotlinx.coroutines.launch
import vu.vpn.common.compose.CollectSideEffectWithLifecycle
import vu.vpn.common.compose.dropUnlessResumed
import vu.vpn.common.compose.showSnackbarImmediately
import vu.vpn.core.LocalResultStore
import vu.vpn.core.Navigator
import vu.vpn.feature.customlist.api.CreateCustomListNavResult
import vu.vpn.feature.customlist.api.DeleteCustomListNavResult
import vu.vpn.feature.customlist.api.EditCustomListNavResult
import vu.vpn.feature.customlist.api.UpdateCustomListNavResult
import vu.vpn.feature.location.api.LocationBottomSheetNavKey
import vu.vpn.feature.location.api.LocationBottomSheetState
import vu.vpn.feature.location.api.SearchLocationNavResult
import vu.vpn.feature.location.impl.ContentType
import vu.vpn.feature.location.impl.EmptyRelayListText
import vu.vpn.feature.location.impl.FilterRow
import vu.vpn.feature.location.impl.bottomsheet.showResultSnackbar
import vu.vpn.feature.location.impl.relayListContent
import vu.vpn.lib.common.Lce
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.RelayItemId
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.ui.component.MullvadSearchBar
import vu.vpn.lib.ui.component.drawVerticalScrollbar
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorLarge
import vu.vpn.lib.ui.designsystem.MullvadSnackbar
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.theme.color.AlphaScrollbar
import vu.vpn.lib.usecase.FilterChip
import org.koin.androidx.compose.koinViewModel
import org.koin.core.parameter.parametersOf

@Preview("Loading|Default|No Locations|Not found|Results")
@Composable
private fun PreviewSearchLocationScreen(
    @PreviewParameter(SearchLocationsUiStatePreviewParameterProvider::class)
    state: Lce<Unit, SearchLocationUiState, Unit>
) {
    AppTheme {
        SearchLocationScreen(
            state = state,
            snackbarHostState = SnackbarHostState(),
            onSelectRelayItem = { _, _ -> },
            onToggleExpand = { _, _, _ -> },
            onSearchInputChanged = {},
            onRemoveOwnershipFilter = {},
            onRemoveProviderFilter = {},
            navigateToBottomSheet = {},
            onGoBack = {},
        )
    }
}

@Suppress("LongMethod", "CyclomaticComplexMethod")
@Composable
fun SearchLocation(relayListType: RelayListType, navigator: Navigator) {

    val viewModel = koinViewModel<SearchLocationViewModel> { parametersOf(relayListType) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }
    val resources = LocalResources.current
    val resultStore = LocalResultStore.current

    CollectSideEffectWithLifecycle(viewModel.uiSideEffect) {
        when (it) {
            is SearchLocationSideEffect.LocationSelected ->
                navigator.goBack(result = SearchLocationNavResult(it.relayListType))

            SearchLocationSideEffect.GenericError ->
                launch {
                    snackbarHostState.showSnackbarImmediately(
                        message = resources.getString(R.string.error_occurred)
                    )
                }
            is SearchLocationSideEffect.EntryAlreadySelected ->
                launch {
                    snackbarHostState.showSnackbarImmediately(
                        message =
                            resources.getString(
                                R.string.relay_item_already_selected_as_entry,
                                it.relayItem.name,
                            )
                    )
                }
            is SearchLocationSideEffect.ExitAlreadySelected ->
                launch {
                    snackbarHostState.showSnackbarImmediately(
                        message =
                            resources.getString(
                                R.string.relay_item_already_selected_as_exit,
                                it.relayItem.name,
                            )
                    )
                }
            is SearchLocationSideEffect.RelayItemInactive -> {
                launch {
                    snackbarHostState.showSnackbarImmediately(
                        message =
                            resources.getString(R.string.relayitem_is_inactive, it.relayItem.name)
                    )
                }
            }
        }
    }

    resultStore.consumeResult<CreateCustomListNavResult> { result ->
        snackbarHostState.showResultSnackbar(
            resources = resources,
            result = result.value,
            onUndo = viewModel::performAction,
        )
    }

    resultStore.consumeResult<EditCustomListNavResult> { result ->
        snackbarHostState.showResultSnackbar(
            resources = resources,
            result = result.value,
            onUndo = viewModel::performAction,
        )
    }

    resultStore.consumeResult<DeleteCustomListNavResult> { result ->
        snackbarHostState.showResultSnackbar(
            resources = resources,
            result = result.value,
            onUndo = viewModel::performAction,
        )
    }

    resultStore.consumeResult<UpdateCustomListNavResult> { result ->
        snackbarHostState.showResultSnackbar(
            resources = resources,
            result = result.value,
            onUndo = viewModel::performAction,
        )
    }

    SearchLocationScreen(
        state = state,
        snackbarHostState = snackbarHostState,
        onSelectRelayItem = viewModel::selectRelayItem,
        onToggleExpand = viewModel::onToggleExpand,
        onSearchInputChanged = viewModel::onSearchInputUpdated,
        onRemoveOwnershipFilter = viewModel::removeOwnerFilter,
        onRemoveProviderFilter = viewModel::removeProviderFilter,
        navigateToBottomSheet =
            dropUnlessResumed { sheetState ->
                navigator.navigate(LocationBottomSheetNavKey(sheetState))
            },
        onGoBack = dropUnlessResumed { navigator.goBack() },
    )
}

@Suppress("LongMethod", "LongParameterList")
@Composable
fun SearchLocationScreen(
    state: Lce<Unit, SearchLocationUiState, Unit>,
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
    onSelectRelayItem: (RelayItem, RelayListType) -> Unit,
    onToggleExpand: (RelayItemId, CustomListId?, Boolean) -> Unit,
    onSearchInputChanged: (String) -> Unit,
    onRemoveOwnershipFilter: () -> Unit,
    onRemoveProviderFilter: () -> Unit,
    onGoBack: () -> Unit,
    navigateToBottomSheet: (LocationBottomSheetState) -> Unit,
) {
    val keyboardController = LocalSoftwareKeyboardController.current
    Scaffold(
        snackbarHost = {
            SnackbarHost(
                snackbarHostState,
                snackbar = { snackbarData -> MullvadSnackbar(snackbarData = snackbarData) },
            )
        }
    ) {
        Column(modifier = Modifier.padding(it)) {
            val focusRequester = remember { FocusRequester() }
            LaunchedEffect(state is Lce.Content) { focusRequester.requestFocus() }
            MullvadSearchBar(
                modifier = Modifier.focusRequester(focusRequester),
                searchTerm = state.contentOrNull()?.searchTerm ?: "",
                enabled = state is Lce.Content,
                onSearchInputChanged = onSearchInputChanged,
                hideKeyboard = { keyboardController?.hide() },
                onGoBack = onGoBack,
            )
            HorizontalDivider(color = MaterialTheme.colorScheme.onSurface)
            val lazyListState = rememberLazyListState()
            LazyColumn(
                modifier =
                    Modifier.fillMaxSize()
                        .padding(horizontal = Dimens.mediumPadding)
                        .background(color = MaterialTheme.colorScheme.surface)
                        .drawVerticalScrollbar(
                            lazyListState,
                            MaterialTheme.colorScheme.onSurface.copy(alpha = AlphaScrollbar),
                        ),
                state = lazyListState,
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                if (state is Lce.Content) {
                    filterRow(
                        filters = state.value.filterChips,
                        onRemoveOwnershipFilter = onRemoveOwnershipFilter,
                        onRemoveProviderFilter = onRemoveProviderFilter,
                    )
                }
                when (state) {
                    is Lce.Loading -> {
                        loading()
                    }
                    is Lce.Error -> {
                        // Relay list is empty
                        item { EmptyRelayListText() }
                    }
                    is Lce.Content -> {
                        relayListContent(
                            relayListItems = state.value.relayListItems,
                            relayListType = state.value.relayListType,
                            onSelectRelayItem = {
                                onSelectRelayItem(it, state.value.relayListType)
                            },
                            onToggleExpand = onToggleExpand,
                            onUpdateBottomSheetState = navigateToBottomSheet,
                            customListHeader = {
                                SectionKicker(label = stringResource(id = R.string.psyco_custom_lists))
                            },
                            locationHeader = {
                                SectionKicker(label = stringResource(id = R.string.psyco_locations))
                            },
                        )
                    }
                }
            }
        }
    }
}

private fun LazyListScope.filterRow(
    filters: List<FilterChip>,
    onRemoveOwnershipFilter: () -> Unit,
    onRemoveProviderFilter: () -> Unit,
) {
    if (filters.isNotEmpty()) {
        item {
            FilterRow(
                filters = filters,
                onRemoveOwnershipFilter = onRemoveOwnershipFilter,
                onRemoveProviderFilter = onRemoveProviderFilter,
            )
        }
    }
}

private fun LazyListScope.loading() {
    item(contentType = ContentType.PROGRESS) { MullvadCircularProgressIndicatorLarge() }
}

// PSYCO · kicker eyebrow cyan uppercase pra section headers da busca ·
// substitui o `ListHeader` padrão (que renderiza em texto neutro) por uma
// versão alinhada com o resto do reskin: caps + cor brand + tipografia minor.
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
                    top = Dimens.smallPadding,
                    bottom = Dimens.miniPadding,
                ),
    )
}
