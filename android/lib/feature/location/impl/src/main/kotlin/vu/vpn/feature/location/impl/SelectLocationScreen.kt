package vu.vpn.feature.location.impl

import vu.vpn.lib.ui.resource.R

import android.annotation.SuppressLint
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.History
import androidx.compose.material.icons.rounded.MoreVert
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalResources
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewParameter
import androidx.compose.ui.unit.Dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import kotlinx.coroutines.launch
import vu.vpn.common.compose.CollectSideEffectWithLifecycle
import vu.vpn.common.compose.dropUnlessResumed
import vu.vpn.common.compose.showSnackbarImmediately
import vu.vpn.core.LocalResultStore
import vu.vpn.core.Navigator
import vu.vpn.feature.customlist.api.CreateCustomListNavKey
import vu.vpn.feature.customlist.api.CreateCustomListNavResult
import vu.vpn.feature.customlist.api.CustomListNavKey
import vu.vpn.feature.customlist.api.DeleteCustomListNavResult
import vu.vpn.feature.customlist.api.EditCustomListNavResult
import vu.vpn.feature.customlist.api.UpdateCustomListNavResult
import vu.vpn.feature.daita.api.DaitaNavKey
import vu.vpn.feature.filter.api.FilterNavKey
import vu.vpn.feature.location.api.LocationBottomSheetNavKey
import vu.vpn.feature.location.api.LocationBottomSheetNavResult
import vu.vpn.feature.location.api.LocationBottomSheetState
import vu.vpn.feature.location.api.SearchLocationNavKey
import vu.vpn.feature.location.api.SearchLocationNavResult
import vu.vpn.feature.location.api.SelectLocationNavResult
import vu.vpn.feature.location.api.UndoChangeMultihopAction
import vu.vpn.feature.location.impl.bottomsheet.showResultSnackbar
import vu.vpn.feature.location.impl.list.SelectLocationList
import vu.vpn.lib.common.Lc
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.HopSelection
import vu.vpn.lib.model.MultihopRelayListType
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorLarge
import vu.vpn.lib.ui.icon.DeleteHistory
import vu.vpn.lib.ui.tag.SELECT_LOCATION_MENU_BUTTON_TEST_TAG
import vu.vpn.lib.ui.tag.SELECT_LOCATION_SCREEN_TEST_TAG
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import org.koin.androidx.compose.koinViewModel

@Preview("Loading|Default|Filters|Multihop|Multihop and Filters")
@Composable
private fun PreviewSelectLocationScreen(
    @PreviewParameter(SelectLocationsUiStatePreviewParameterProvider::class)
    state: Lc<Unit, SelectLocationUiState>
) {
    AppTheme {
        SelectLocationScreen(
            state = state,
            snackbarHostState = SnackbarHostState(),
            onSelectSinglehop = {},
            onModifyMultihop = { _, _ -> },
            onSearchClick = {},
            onBackClick = {},
            onFilterClick = {},
            onEditCustomLists = {},
            onRecentsToggleEnableClick = {},
            removeOwnershipFilter = {},
            removeProviderFilter = {},
            onSelectRelayList = {},
            openDaitaSettings = {},
            onRefreshRelayList = {},
            scrollToItem = {},
            toggleMultihop = {},
            onCreateCustomList = {},
            navigateToBottomSheet = {},
        )
    }
}

@SuppressLint("CheckResult")
@Suppress("LongMethod", "CyclomaticComplexMethod")
@Composable
fun SelectLocation(navigator: Navigator, initialHop: MultihopRelayListType? = null) {
    val vm = koinViewModel<SelectLocationViewModel>()
    val state = vm.uiState.collectAsStateWithLifecycle()

    // PSYCO · quando aberto pela seção stringResource(id = R.string.psyco_servers) do Multihop, pré-seleciona
    // a aba entry/exit em vez do default EXIT.
    LaunchedEffect(initialHop) { initialHop?.let { vm.selectRelayList(it) } }

    val snackbarHostState = remember { SnackbarHostState() }
    val resources = LocalResources.current
    val resultStore = LocalResultStore.current

    CollectSideEffectWithLifecycle(vm.uiSideEffect) {
        when (it) {
            SelectLocationSideEffect.CloseScreen ->
                navigator.goBack(result = SelectLocationNavResult(true))

            SelectLocationSideEffect.GenericError ->
                launch {
                    snackbarHostState.showSnackbarImmediately(
                        message = resources.getString(R.string.error_occurred)
                    )
                }

            is SelectLocationSideEffect.EntryAlreadySelected ->
                launch {
                    snackbarHostState.showSnackbarImmediately(
                        message =
                            resources.getString(
                                R.string.relay_item_already_selected_as_entry,
                                it.relayItem.name,
                            )
                    )
                }

            is SelectLocationSideEffect.ExitAlreadySelected ->
                launch {
                    snackbarHostState.showSnackbarImmediately(
                        message =
                            resources.getString(
                                R.string.relay_item_already_selected_as_exit,
                                it.relayItem.name,
                            )
                    )
                }

            is SelectLocationSideEffect.RelayItemInactive ->
                launch {
                    snackbarHostState.showSnackbarImmediately(
                        message =
                            resources.getString(R.string.relayitem_is_inactive, it.relayItem.name)
                    )
                }

            SelectLocationSideEffect.EntryAndExitAreSame ->
                launch {
                    snackbarHostState.showSnackbarImmediately(
                        message = resources.getString(R.string.entry_and_exit_are_same)
                    )
                }

            SelectLocationSideEffect.RelayListUpdating ->
                launch {
                    snackbarHostState.showSnackbarImmediately(
                        message =
                            resources.getString(R.string.updating_server_list_in_the_background)
                    )
                }
        }
    }

    resultStore.consumeResult<LocationBottomSheetNavResult> { result ->
        when (result) {
            is LocationBottomSheetNavResult.CustomListActionToast ->
                snackbarHostState.showResultSnackbar(
                    resources = resources,
                    result = result.resultData,
                    onUndo = vm::performAction,
                )

            LocationBottomSheetNavResult.GenericError ->
                snackbarHostState.showSnackbarImmediately(
                    message = resources.getString(R.string.error_occurred)
                )

            is LocationBottomSheetNavResult.EntryAlreadySelected ->
                snackbarHostState.showSnackbarImmediately(
                    message =
                        resources.getString(
                            R.string.relay_item_already_selected_as_entry,
                            result.relayItem.name,
                        )
                )

            is LocationBottomSheetNavResult.ExitAlreadySelected ->
                snackbarHostState.showSnackbarImmediately(
                    message =
                        resources.getString(
                            R.string.relay_item_already_selected_as_exit,
                            result.relayItem.name,
                        )
                )

            is LocationBottomSheetNavResult.RelayItemInactive ->
                snackbarHostState.showSnackbarImmediately(
                    message =
                        resources.getString(R.string.relayitem_is_inactive, result.relayItem.name)
                )

            LocationBottomSheetNavResult.EntryAndExitAreSame ->
                snackbarHostState.showSnackbarImmediately(
                    message = resources.getString(R.string.entry_and_exit_are_same)
                )

            is LocationBottomSheetNavResult.MultihopChanged -> {
                snackbarHostState.showSnackbarImmediately(
                    message =
                        resources.getString(
                            when (result.undoChangeMultihopAction) {
                                UndoChangeMultihopAction.Disable,
                                is UndoChangeMultihopAction.DisableAndSetExit,
                                is UndoChangeMultihopAction.DisableAndSetEntry ->
                                    R.string.multihop_is_enabled

                                else -> R.string.multihop_is_disabled
                            }
                        ),
                    actionLabel = resources.getString(R.string.undo),
                    onAction = { vm.undoMultihopAction(result.undoChangeMultihopAction) },
                    duration = SnackbarDuration.Long,
                )
            }
        }
    }

    resultStore.consumeResult<CreateCustomListNavResult> { result ->
        snackbarHostState.showResultSnackbar(
            resources = resources,
            result = result.value,
            onUndo = vm::performAction,
        )
    }

    resultStore.consumeResult<EditCustomListNavResult> { result ->
        snackbarHostState.showResultSnackbar(
            resources = resources,
            result = result.value,
            onUndo = vm::performAction,
        )
    }

    resultStore.consumeResult<DeleteCustomListNavResult> { result ->
        snackbarHostState.showResultSnackbar(
            resources = resources,
            result = result.value,
            onUndo = vm::performAction,
        )
    }

    resultStore.consumeResult<UpdateCustomListNavResult> { result ->
        snackbarHostState.showResultSnackbar(
            resources = resources,
            result = result.value,
            onUndo = vm::performAction,
        )
    }

    resultStore.consumeResult<SearchLocationNavResult> { result ->
        when (val type = result.relayListType) {
            RelayListType.Single -> navigator.goBack(result = SelectLocationNavResult(true))
            is RelayListType.Multihop ->
                when (type.multihopRelayListType) {
                    MultihopRelayListType.ENTRY -> vm.selectRelayList(MultihopRelayListType.EXIT)
                    MultihopRelayListType.EXIT ->
                        navigator.goBack(result = SelectLocationNavResult(true))
                }
        }
    }

    SelectLocationScreen(
        state = state.value,
        snackbarHostState = snackbarHostState,
        onSelectSinglehop = vm::selectSingle,
        onModifyMultihop = vm::modifyMultihop,
        onSearchClick =
            dropUnlessResumed { relayListType ->
                navigator.navigate(SearchLocationNavKey(relayListType))
            },
        onCreateCustomList = dropUnlessResumed { navigator.navigate(CreateCustomListNavKey()) },
        onBackClick = dropUnlessResumed { navigator.goBack() },
        onFilterClick = dropUnlessResumed { navigator.navigate(FilterNavKey) },
        onEditCustomLists = dropUnlessResumed { navigator.navigate(CustomListNavKey) },
        removeOwnershipFilter = vm::removeOwnerFilter,
        removeProviderFilter = vm::removeProviderFilter,
        onSelectRelayList = vm::selectRelayList,
        onRecentsToggleEnableClick = vm::toggleRecentsEnabled,
        openDaitaSettings = dropUnlessResumed { navigator.navigate(DaitaNavKey(isModal = true)) },
        onRefreshRelayList = vm::refreshRelayList,
        toggleMultihop = vm::toggleMultihop,
        scrollToItem = vm::scrollToItem,
        navigateToBottomSheet =
            dropUnlessResumed { sheetState ->
                navigator.navigate(LocationBottomSheetNavKey(sheetState))
            },
    )
}

@Suppress("LongMethod", "LongParameterList", "CyclomaticComplexMethod")
@Composable
fun SelectLocationScreen(
    state: Lc<Unit, SelectLocationUiState>,
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
    onSelectSinglehop: (item: RelayItem) -> Unit,
    onModifyMultihop: (relayItem: RelayItem, relayListType: MultihopRelayListType) -> Unit,
    onSearchClick: (RelayListType) -> Unit,
    onBackClick: () -> Unit,
    onFilterClick: () -> Unit,
    onCreateCustomList: () -> Unit,
    onEditCustomLists: () -> Unit,
    onRecentsToggleEnableClick: () -> Unit,
    removeOwnershipFilter: () -> Unit,
    removeProviderFilter: () -> Unit,
    onSelectRelayList: (MultihopRelayListType) -> Unit,
    openDaitaSettings: () -> Unit,
    onRefreshRelayList: () -> Unit,
    scrollToItem: (ScrollEvent) -> Unit,
    toggleMultihop: (Boolean) -> Unit,
    navigateToBottomSheet: (LocationBottomSheetState) -> Unit,
) {
    val backgroundColor = MaterialTheme.colorScheme.surface

    Scaffold(
        modifier = Modifier.testTag(SELECT_LOCATION_SCREEN_TEST_TAG),
        containerColor = backgroundColor,
        contentColor = MaterialTheme.colorScheme.onSurface,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            val recentsEnabled = state.contentOrNull()?.isRecentsEnabled == true
            val menuScope = rememberCoroutineScope()
            val recentsDisabledText = stringResource(id = R.string.recents_disabled)
            SelectLocationHeader(
                title = stringResource(id = R.string.psyco_select_location_title),
                backContentDescription = stringResource(id = R.string.back),
                onBackClick = onBackClick,
                trailing = {
                    SelectLocationDropdownMenu(
                        recentsEnabled = recentsEnabled,
                        onRecentsToggleEnableClick = {
                            if (recentsEnabled) {
                                menuScope.launch {
                                    snackbarHostState.showSnackbarImmediately(recentsDisabledText)
                                }
                            }
                            onRecentsToggleEnableClick()
                        },
                        onRefreshRelayList = onRefreshRelayList,
                    )
                },
            )
        },
    ) { paddingValues ->
        Column(
            modifier = Modifier.padding(paddingValues).background(backgroundColor).fillMaxSize()
        ) {
            when (state) {
                is Lc.Loading ->
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        MullvadCircularProgressIndicatorLarge()
                    }

                is Lc.Content -> {
                    // "Última saída" = the currently selected exit. Multihop is no
                    // longer surfaced in this UI, but resolve its exit anyway so the
                    // card is correct if multihop is ever toggled on elsewhere.
                    val exitConstraint =
                        when (val hop = state.value.hopSelection) {
                            is HopSelection.Single -> hop.relay
                            is HopSelection.Multi -> hop.exit
                        }
                    Column(modifier = Modifier.padding(horizontal = Dimens.mediumPadding)) {
                        LastExitCard(
                            label = stringResource(id = R.string.psyco_last_exit),
                            exitName = exitConstraint.toDisplayName(),
                        )
                        Spacer(modifier = Modifier.height(Dimens.smallPadding))
                        SearchFieldButton(
                            placeholder = stringResource(id = R.string.psyco_locations),
                            onClick = { onSearchClick(state.value.relayListType) },
                        )
                    }
                    RelayLists(
                        relayListType = state.value.relayListType,
                        bottomMargin = Dimens.mediumPadding,
                        onSelect = onSelectSinglehop,
                        onModifyMultihop = onModifyMultihop,
                        openDaitaSettings = openDaitaSettings,
                        onAddCustomList = onCreateCustomList,
                        onEditCustomLists = onEditCustomLists,
                        onUpdateBottomSheetState = navigateToBottomSheet,
                    )
                }
            }
        }
    }
}

@Composable
private fun SelectLocationDropdownMenu(
    recentsEnabled: Boolean,
    onRecentsToggleEnableClick: () -> Unit,
    onRefreshRelayList: () -> Unit,
) {
    var showMenu by remember { mutableStateOf(false) }

    RoundIconButton(
        icon = Icons.Rounded.MoreVert,
        contentDescription = stringResource(R.string.more_actions),
        onClick = { showMenu = !showMenu },
        modifier = Modifier.testTag(SELECT_LOCATION_MENU_BUTTON_TEST_TAG),
    )
    DropdownMenu(
        modifier = Modifier.background(MaterialTheme.colorScheme.tertiaryContainer),
        expanded = showMenu,
        onDismissRequest = { showMenu = false },
    ) {
        val colors = MenuDefaults.itemColors(leadingIconColor = MaterialTheme.colorScheme.onPrimary)

        // Keep the asset in remember so it doesn't flip as the menu animates away.
        var recentsItemTextId by remember {
            mutableIntStateOf(
                if (recentsEnabled) R.string.disable_recents else R.string.enable_recents
            )
        }
        var recentsIcon by remember {
            mutableStateOf(if (recentsEnabled) DeleteHistory else Icons.Rounded.History)
        }
        DropdownMenuItem(
            text = { Text(text = stringResource(recentsItemTextId)) },
            onClick = {
                showMenu = false
                onRecentsToggleEnableClick()
            },
            colors = colors,
            leadingIcon = { Icon(imageVector = recentsIcon, contentDescription = null) },
        )

        DropdownMenuItem(
            text = { Text(text = stringResource(R.string.refresh_server_list)) },
            onClick = {
                showMenu = false
                onRefreshRelayList()
            },
            colors = colors,
            leadingIcon = { Icon(Icons.Rounded.Refresh, contentDescription = null) },
        )
    }
}

@Composable
@Suppress("ComplexCondition")
private fun RelayLists(
    relayListType: RelayListType,
    bottomMargin: Dp,
    onSelect: (item: RelayItem) -> Unit,
    onModifyMultihop: (RelayItem, MultihopRelayListType) -> Unit,
    openDaitaSettings: () -> Unit,
    onAddCustomList: () -> Unit,
    onEditCustomLists: (() -> Unit)?,
    onUpdateBottomSheetState: (LocationBottomSheetState) -> Unit,
) {
    val onSelectRelayItem: (RelayItem, RelayListType) -> Unit = { relayItem, relayListType ->
        if (relayListType is RelayListType.Multihop) {
            onModifyMultihop(relayItem, relayListType.multihopRelayListType)
        } else {
            onSelect(relayItem)
        }
    }

    val lazyListStates = remember { mutableStateMapOf<RelayListType, LazyListState>() }
    val scrollToLists = remember { mutableSetOf<RelayListType>() }

    Crossfade(relayListType) {
        when (it) {
            is RelayListType.Multihop ->
                when (it.multihopRelayListType) {
                    MultihopRelayListType.ENTRY ->
                        SelectLocationList(
                            relayListType = it,
                            bottomMargin = bottomMargin,
                            onSelectRelayItem = onSelectRelayItem,
                            openDaitaSettings = openDaitaSettings,
                            onAddCustomList = onAddCustomList,
                            onEditCustomLists = onEditCustomLists,
                            onUpdateBottomSheetState = onUpdateBottomSheetState,
                            lazyListState =
                                lazyListStates.getOrPut(it, { rememberLazyListState() }),
                            scrollToList = scrollToLists.add(it),
                        )

                    MultihopRelayListType.EXIT ->
                        SelectLocationList(
                            relayListType = it,
                            bottomMargin = bottomMargin,
                            onSelectRelayItem = onSelectRelayItem,
                            openDaitaSettings = openDaitaSettings,
                            onAddCustomList = onAddCustomList,
                            onEditCustomLists = onEditCustomLists,
                            onUpdateBottomSheetState = onUpdateBottomSheetState,
                            lazyListState =
                                lazyListStates.getOrPut(it, { rememberLazyListState() }),
                            scrollToList = scrollToLists.add(it),
                        )
                }

            RelayListType.Single ->
                SelectLocationList(
                    relayListType = it,
                    bottomMargin = bottomMargin,
                    onSelectRelayItem = onSelectRelayItem,
                    openDaitaSettings = openDaitaSettings,
                    onAddCustomList = onAddCustomList,
                    onEditCustomLists = onEditCustomLists,
                    onUpdateBottomSheetState = onUpdateBottomSheetState,
                    lazyListState = lazyListStates.getOrPut(it, { rememberLazyListState() }),
                    scrollToList = scrollToLists.add(it),
                )
        }
    }
}

@Composable
fun Constraint<RelayItem>?.toDisplayName() =
    when (this) {
        Constraint.Any -> stringResource(R.string.automatic)
        is Constraint.Only<RelayItem> -> value.name
        null -> stringResource(R.string.unavailable)
    }
