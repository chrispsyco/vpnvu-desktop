package vu.vpn.feature.home.impl.devicerevoked

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import vu.vpn.lib.ui.designsystem.NegativeButton
import vu.vpn.lib.ui.designsystem.VariantButton
import vu.vpn.lib.ui.resource.R

@Composable
fun DeviceRevokedLoginButton(onClick: () -> Unit, state: DeviceRevokedUiState) {
    if (state == DeviceRevokedUiState.SECURED) {
        NegativeButton(text = stringResource(id = R.string.go_to_login), onClick = onClick)
    } else {
        VariantButton(text = stringResource(id = R.string.go_to_login), onClick = onClick)
    }
}
