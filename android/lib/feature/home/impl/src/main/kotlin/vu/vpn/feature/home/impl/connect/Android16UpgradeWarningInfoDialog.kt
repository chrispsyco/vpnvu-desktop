package vu.vpn.feature.home.impl.connect

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.common.compose.clickableAnnotatedString
import vu.vpn.common.compose.createCopyToClipboardHandle
import vu.vpn.core.Navigator
import vu.vpn.lib.ui.component.dialog.InfoDialog
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.theme.AppTheme

@Preview
@Composable
private fun PreviewAndroid16UpgradeWarningInfoDialog() {
    AppTheme { Android16UpgradeWarningInfoDialog(onDismiss = {}, onClickEmail = {}) }
}

@Composable
fun Android16UpgradeWarningInfo(navigator: Navigator) {
    val copyToClipboard = createCopyToClipboardHandle(isSensitive = false)
    Android16UpgradeWarningInfoDialog(
        onDismiss = dropUnlessResumed { navigator.goBack() },
        onClickEmail = { email -> copyToClipboard(email, null) },
    )
}

@Composable
fun Android16UpgradeWarningInfoDialog(onDismiss: () -> Unit, onClickEmail: (String) -> Unit) {
    InfoDialog(
        title = stringResource(id = R.string.android_16_upgrade_warning_title),
        message = stringResource(id = R.string.android_16_upgrade_warning_dialog_first_message),
        additionalInfo =
            clickableAnnotatedString(
                text = stringResource(R.string.android_16_upgrade_warning_dialog_second_message),
                linkStyle =
                    SpanStyle(
                        color = MaterialTheme.colorScheme.onSurface,
                        textDecoration = TextDecoration.Underline,
                    ),
                argument = stringResource(R.string.support_email),
                onClick = onClickEmail,
            ),
        showIcon = false,
        onDismiss = onDismiss,
    )
}
