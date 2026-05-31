package vu.vpn.feature.customlist.impl.screen.editname

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.common.compose.CollectSideEffectWithLifecycle
import vu.vpn.core.Navigator
import vu.vpn.feature.customlist.api.EditCustomListNameNavKey
import vu.vpn.feature.customlist.api.EditCustomListNavResult
import vu.vpn.feature.customlist.impl.component.CustomListNameTextField
import vu.vpn.lib.model.GetCustomListError
import vu.vpn.lib.model.NameAlreadyExists
import vu.vpn.lib.model.NameIsEmpty
import vu.vpn.lib.model.UnknownCustomListError
import vu.vpn.lib.ui.component.dialog.InputDialog
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.tag.EDIT_CUSTOM_LIST_DIALOG_INPUT_TEST_TAG
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.usecase.customlists.RenameError
import org.koin.androidx.compose.koinViewModel
import org.koin.core.parameter.parametersOf

@Preview
@Composable
private fun PreviewEditCustomListNameDialog() {
    AppTheme {
        EditCustomListNameDialog(
            state = EditCustomListNameUiState(),
            updateName = {},
            onInputChanged = {},
            onDismiss = {},
        )
    }
}

@Composable
fun EditCustomListName(navArgs: EditCustomListNameNavKey, navigator: Navigator) {
    val vm: EditCustomListNameDialogViewModel = koinViewModel { parametersOf(navArgs) }

    CollectSideEffectWithLifecycle(vm.uiSideEffect) { sideEffect ->
        when (sideEffect) {
            is EditCustomListNameDialogSideEffect.ReturnWithResult -> {
                navigator.goBack(result = EditCustomListNavResult(sideEffect.result))
            }
        }
    }

    val state by vm.uiState.collectAsStateWithLifecycle()
    EditCustomListNameDialog(
        state = state,
        updateName = vm::updateCustomListName,
        onInputChanged = vm::onNameChanged,
        onDismiss = dropUnlessResumed { navigator.goBack() },
    )
}

@Composable
fun EditCustomListNameDialog(
    state: EditCustomListNameUiState,
    updateName: (String) -> Unit,
    onInputChanged: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    InputDialog(
        title = stringResource(id = R.string.update_list_name),
        confirmButtonText = stringResource(id = R.string.save),
        onBack = onDismiss,
        onConfirm = { updateName(state.name) },
        input = {
            CustomListNameTextField(
                name = state.name,
                isValidName = state.isValidName,
                error = state.error?.errorString(),
                onSubmit = updateName,
                onValueChanged = onInputChanged,
                modifier = Modifier.testTag(EDIT_CUSTOM_LIST_DIALOG_INPUT_TEST_TAG),
            )
        },
    )
}

@Composable
private fun RenameError.errorString() =
    stringResource(
        when (error) {
            is NameAlreadyExists -> R.string.custom_list_error_list_exists
            is NameIsEmpty -> R.string.custom_list_error_list_is_empty
            is GetCustomListError,
            is UnknownCustomListError -> R.string.error_occurred
        }
    )
