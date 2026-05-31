package vu.vpn.feature.vpnsettings.impl.info

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.core.Navigator
import vu.vpn.lib.ui.component.dialog.InfoDialog
import vu.vpn.lib.ui.resource.R

@Composable
fun Ipv6Info(navigator: Navigator) {
    InfoDialog(
        message = stringResource(R.string.ipv6_info),
        onDismiss = dropUnlessResumed { navigator.goBack() },
    )
}
