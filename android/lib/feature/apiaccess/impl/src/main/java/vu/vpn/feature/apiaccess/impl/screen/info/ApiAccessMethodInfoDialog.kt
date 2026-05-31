package vu.vpn.feature.apiaccess.impl.screen.info

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import vu.vpn.core.EmptyNavigator
import vu.vpn.core.Navigator
import vu.vpn.lib.ui.component.dialog.InfoDialog
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.theme.AppTheme

@Preview
@Composable
private fun PreviewApiAccessMethodInfoDialog() {
    AppTheme { ApiAccessMethodInfo(EmptyNavigator) }
}

@Composable
fun ApiAccessMethodInfo(navigator: Navigator) {
    InfoDialog(
        message =
            buildString {
                appendLine(stringResource(id = R.string.api_access_method_info_first_line))
                appendLine()
                appendLine(stringResource(id = R.string.api_access_method_info_second_line))
                appendLine()
                appendLine(stringResource(id = R.string.api_access_method_info_third_line))
                appendLine()
                appendLine(stringResource(id = R.string.api_access_method_info_fourth_line))
            },
        onDismiss = navigator::goBack,
    )
}
