package vu.vpn.feature.serveripoverride.impl.info

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.core.EmptyNavigator
import vu.vpn.core.Navigator
import vu.vpn.lib.ui.component.dialog.InfoDialog
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.theme.AppTheme

@Preview
@Composable
private fun PreviewServerIpOverridesInfoDialog() {
    AppTheme { ServerIpOverridesInfo(EmptyNavigator) }
}

@Composable
fun ServerIpOverridesInfo(navigator: Navigator) {
    InfoDialog(
        message =
            buildString {
                appendLine(stringResource(id = R.string.server_ip_overrides_info_first_paragraph))
                appendLine()
                appendLine(stringResource(id = R.string.server_ip_overrides_info_second_paragraph))
                appendLine()
                append(stringResource(id = R.string.server_ip_overrides_info_third_paragraph))
            },
        onDismiss = dropUnlessResumed { navigator.goBack() },
    )
}
