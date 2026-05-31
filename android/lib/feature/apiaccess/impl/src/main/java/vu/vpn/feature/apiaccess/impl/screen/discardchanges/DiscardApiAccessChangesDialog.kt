package vu.vpn.feature.apiaccess.impl.screen.discardchanges

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import vu.vpn.core.EmptyNavigator
import vu.vpn.core.Navigator
import vu.vpn.feature.apiaccess.api.DiscardApiAccessChangesConfirmedNavResult
import vu.vpn.lib.ui.component.dialog.InfoConfirmationDialog
import vu.vpn.lib.ui.component.dialog.InfoConfirmationDialogTitleType
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.theme.AppTheme

@Preview
@Composable
private fun PreviewApiAccessDiscardChangesDialog() {
    AppTheme { DiscardApiAccessChanges(EmptyNavigator) }
}

@Composable
fun DiscardApiAccessChanges(navigator: Navigator) {
    InfoConfirmationDialog(
        onResult = {
            if (it != null) {
                navigator.goBack(result = DiscardApiAccessChangesConfirmedNavResult)
            } else {
                navigator.goBack()
            }
        },
        titleType =
            InfoConfirmationDialogTitleType.TitleOnly(stringResource(R.string.discard_changes)),
        confirmButtonTitle = stringResource(R.string.discard),
        cancelButtonTitle = stringResource(R.string.cancel),
    )
}
