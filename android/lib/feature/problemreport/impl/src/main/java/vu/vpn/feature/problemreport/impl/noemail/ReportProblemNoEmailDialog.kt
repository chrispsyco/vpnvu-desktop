package vu.vpn.feature.problemreport.impl.noemail

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.core.EmptyNavigator
import vu.vpn.core.Navigator
import vu.vpn.feature.problemreport.api.ProblemReportNoEmailConfirmedNavResult
import vu.vpn.lib.ui.component.dialog.NegativeConfirmationDialog
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.theme.AppTheme

@Preview
@Composable
private fun PreviewReportProblemNoEmailDialog() {
    AppTheme { ReportProblemNoEmail(EmptyNavigator) }
}

@Composable
fun ReportProblemNoEmail(navigator: Navigator) {
    NegativeConfirmationDialog(
        message = stringResource(id = R.string.confirm_no_email),
        confirmationText = stringResource(id = R.string.send_anyway),
        cancelText = stringResource(id = R.string.back),
        messageStyle = MaterialTheme.typography.labelLarge,
        messageColor = MaterialTheme.colorScheme.onSurfaceVariant,
        onBack = dropUnlessResumed { navigator.goBack() },
        onConfirm =
            dropUnlessResumed { navigator.goBack(result = ProblemReportNoEmailConfirmedNavResult) },
    )
}
