package vu.vpn.feature.home.impl.welcome

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.core.Navigator
import vu.vpn.lib.ui.component.dialog.InfoDialog
import vu.vpn.lib.ui.resource.R

@Composable
fun DeviceNameInfo(navigator: Navigator) {
    InfoDialog(
        message =
            buildString {
                appendLine(stringResource(id = R.string.device_name_info_first_paragraph))
                appendLine()
                appendLine(stringResource(id = R.string.device_name_info_second_paragraph))
                appendLine()
                append(stringResource(id = R.string.device_name_info_third_paragraph))
            },
        onDismiss = dropUnlessResumed { navigator.goBack() },
    )
}
