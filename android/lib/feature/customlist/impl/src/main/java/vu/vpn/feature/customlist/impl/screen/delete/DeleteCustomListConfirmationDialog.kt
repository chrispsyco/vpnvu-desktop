package vu.vpn.feature.customlist.impl.screen.delete

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.common.compose.CollectSideEffectWithLifecycle
import vu.vpn.core.Navigator
import vu.vpn.feature.customlist.api.DeleteCustomListNavKey
import vu.vpn.feature.customlist.api.DeleteCustomListNavResult
import vu.vpn.lib.model.CustomListName
import vu.vpn.lib.ui.component.dialog.NegativeConfirmationDialog
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.theme.AppTheme
import org.koin.androidx.compose.koinViewModel
import org.koin.core.parameter.parametersOf

@Preview
@Composable
private fun PreviewRemoveDeviceConfirmationDialog() {
    AppTheme {
        DeleteCustomListConfirmationDialog(
            state = DeleteCustomListUiState(CustomListName.fromString("My Custom List"), null),
            onDelete = {},
            onBack = {},
        )
    }
}

@Composable
fun DeleteCustomList(navArgs: DeleteCustomListNavKey, navigator: Navigator) {
    val viewModel: DeleteCustomListConfirmationViewModel = koinViewModel() { parametersOf(navArgs) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    CollectSideEffectWithLifecycle(viewModel.uiSideEffect) {
        when (it) {
            is DeleteCustomListConfirmationSideEffect.ReturnWithResult ->
                navigator.goBack(result = DeleteCustomListNavResult(it.result))
        }
    }

    DeleteCustomListConfirmationDialog(
        state = state,
        onDelete = viewModel::deleteCustomList,
        onBack = dropUnlessResumed { navigator.goBack() },
    )
}

@Composable
fun DeleteCustomListConfirmationDialog(
    state: DeleteCustomListUiState,
    onDelete: () -> Unit,
    onBack: () -> Unit,
) {
    NegativeConfirmationDialog(
        onConfirm = onDelete,
        onBack = onBack,
        message =
            stringResource(
                id = R.string.delete_custom_list_confirmation_description,
                state.name.value,
            ),
        errorMessage =
            if (state.deleteError != null) {
                stringResource(id = R.string.error_occurred)
            } else {
                null
            },
    )
}
