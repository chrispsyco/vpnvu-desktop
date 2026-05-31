package vu.vpn.feature.vpnsettings.impl.info

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.core.Navigator
import vu.vpn.lib.ui.component.dialog.InfoDialog
import vu.vpn.lib.ui.resource.R

@Composable
fun DeviceIpInfo(navigator: Navigator) {
    InfoDialog(
        message =
            buildString {
                append(stringResource(R.string.device_ip_info_first_paragraph))
                appendLine()
                appendLine()
                append(stringResource(R.string.device_ip_info_second_paragraph))
            },
        onDismiss = dropUnlessResumed { navigator.goBack() },
    )
}
