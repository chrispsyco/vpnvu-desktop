package vu.vpn.feature.vpnsettings.impl.info

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
private fun PreviewQuantumResistanceInfoDialog() {
    AppTheme { QuantumResistanceInfo(EmptyNavigator) }
}

@Composable
fun QuantumResistanceInfo(navigator: Navigator) {
    InfoDialog(
        message = stringResource(id = R.string.quantum_resistant_info_first_paragaph),
        additionalInfo = stringResource(id = R.string.quantum_resistant_info_second_paragaph),
        onDismiss = dropUnlessResumed { navigator.goBack() },
    )
}
