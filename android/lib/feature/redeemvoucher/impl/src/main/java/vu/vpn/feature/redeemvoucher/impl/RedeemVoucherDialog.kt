package vu.vpn.feature.redeemvoucher.impl

import android.content.res.Configuration
import android.os.Build
import android.view.WindowManager
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.tooling.preview.Devices
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.window.DialogProperties
import androidx.compose.ui.window.DialogWindowProvider
import androidx.compose.ui.window.SecureFlagPolicy
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import java.util.concurrent.TimeUnit
import vu.vpn.common.compose.dropUnlessResumed
import vu.vpn.core.Navigator
import vu.vpn.feature.redeemvoucher.api.RedeemVoucherNavResult
import vu.vpn.lib.model.DAYS_PER_VOUCHER_MONTH
import vu.vpn.lib.model.RedeemVoucherError
import vu.vpn.lib.ui.component.textfield.CustomTextField
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorSmall
import vu.vpn.lib.ui.designsystem.PrimaryButton
import vu.vpn.lib.ui.designsystem.VariantButton
import vu.vpn.lib.ui.tag.VOUCHER_INPUT_TEST_TAG
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import org.koin.androidx.compose.koinViewModel

@Preview(device = Devices.TV_720p)
@Composable
private fun PreviewRedeemVoucherDialog() {
    AppTheme {
        RedeemVoucherDialog(
            state = VoucherDialogUiState.INITIAL,
            onVoucherInputChange = {},
            onRedeem = {},
            onDismiss = {},
        )
    }
}

@Preview(uiMode = Configuration.UI_MODE_NIGHT_YES, device = Devices.PIXEL_3)
@Composable
private fun PreviewRedeemVoucherDialogVerifying() {
    AppTheme {
        RedeemVoucherDialog(
            state = VoucherDialogUiState("", VoucherDialogState.Verifying),
            onVoucherInputChange = {},
            onRedeem = {},
            onDismiss = {},
        )
    }
}

@Preview(uiMode = Configuration.UI_MODE_NIGHT_YES, device = Devices.PIXEL_3)
@Composable
private fun PreviewRedeemVoucherDialogError() {
    AppTheme {
        RedeemVoucherDialog(
            state =
                VoucherDialogUiState(
                    "",
                    VoucherDialogState.Error.DaemonError(RedeemVoucherError.InvalidVoucher),
                ),
            onVoucherInputChange = {},
            onRedeem = {},
            onDismiss = {},
        )
    }
}

@Preview(uiMode = Configuration.UI_MODE_NIGHT_YES, device = Devices.PIXEL_3)
@Composable
private fun PreviewRedeemVoucherDialogSuccess() {
    AppTheme {
        RedeemVoucherDialog(
            state = VoucherDialogUiState("", VoucherDialogState.Success(3600)),
            onVoucherInputChange = {},
            onRedeem = {},
            onDismiss = {},
        )
    }
}

@Composable
fun RedeemVoucher(navigator: Navigator) {
    val vm = koinViewModel<VoucherDialogViewModel>()
    val state by vm.uiState.collectAsStateWithLifecycle()
    RedeemVoucherDialog(
        state = state,
        onVoucherInputChange = vm::onVoucherInputChange,
        onRedeem = vm::onRedeem,
        onDismiss =
            dropUnlessResumed { isTimeAdded ->
                navigator.goBack(result = RedeemVoucherNavResult(isTimeAdded))
            },
    )
}

@Composable
fun RedeemVoucherDialog(
    state: VoucherDialogUiState,
    onVoucherInputChange: (String) -> Unit,
    onRedeem: (voucherCode: String) -> Unit,
    onDismiss: (isTimeAdded: Boolean) -> Unit,
) {
    AlertDialog(
        title = {
            if (state.voucherState !is VoucherDialogState.Success)
                Text(text = stringResource(id = R.string.enter_voucher_code))
        },
        confirmButton = {
            Column {
                if (state.voucherState !is VoucherDialogState.Success) {
                    VariantButton(
                        text = stringResource(id = R.string.redeem),
                        onClick = { onRedeem(state.voucherInput) },
                        // Match the desktop: keep Resgatar dimmed until a full
                        // 16-char code is entered (and not mid-verification).
                        isEnabled =
                            state.voucherInput.length == MAX_VOUCHER_LENGTH &&
                                state.voucherState !is VoucherDialogState.Verifying,
                        modifier = Modifier.padding(bottom = Dimens.buttonSpacing),
                    )
                }
                PrimaryButton(
                    text =
                        stringResource(
                            id =
                                if (state.voucherState is VoucherDialogState.Success)
                                    R.string.got_it
                                else R.string.cancel
                        ),
                    onClick = { onDismiss(state.voucherState is VoucherDialogState.Success) },
                )
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                DialogBackgroundBlur()
                TimeUnit.DAYS.toSeconds(1)
                if (state.voucherState is VoucherDialogState.Success) {
                    val days: Int =
                        (state.voucherState.addedTime / TimeUnit.DAYS.toSeconds(1)).toInt()
                    val message =
                        stringResource(
                            R.string.added_to_your_account,
                            when {
                                days == 0 -> {
                                    stringResource(R.string.less_than_one_day)
                                }
                                days < 2 * DAYS_PER_VOUCHER_MONTH -> {
                                    pluralStringResource(id = R.plurals.days, count = days, days)
                                }
                                else -> {
                                    pluralStringResource(
                                        id = R.plurals.months,
                                        count = days / DAYS_PER_VOUCHER_MONTH,
                                        days / DAYS_PER_VOUCHER_MONTH,
                                    )
                                }
                            },
                        )
                    RedeemSuccessBody(message = message)
                } else {

                    EnterVoucherBody(
                        state = state,
                        onVoucherInputChange = onVoucherInputChange,
                        onRedeem = onRedeem,
                    )
                }
            }
        },
        containerColor = MaterialTheme.colorScheme.surface,
        titleContentColor = MaterialTheme.colorScheme.onSurface,
        onDismissRequest = { onDismiss(state.voucherState is VoucherDialogState.Success) },
        properties =
            DialogProperties(
                securePolicy =
                    if (BuildConfig.DEBUG) SecureFlagPolicy.Inherit else SecureFlagPolicy.SecureOn
            ),
    )
}

// Blurs the content behind the dialog to echo the desktop's backdrop blur.
// Window blur-behind needs API 31+ AND device support (cross-window blur can be
// turned off system-wide); when unavailable this is a no-op and the plain scrim
// stays. Driven from inside the dialog so it targets the dialog's own window.
@Composable
private fun DialogBackgroundBlur() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
    val view = LocalView.current
    LaunchedEffect(view) {
        val window = (view.parent as? DialogWindowProvider)?.window ?: return@LaunchedEffect
        window.addFlags(WindowManager.LayoutParams.FLAG_BLUR_BEHIND)
        val params = window.attributes
        params.blurBehindRadius = BLUR_BEHIND_RADIUS_PX
        window.attributes = params
    }
}

private const val BLUR_BEHIND_RADIUS_PX = 60

@Composable
private fun RedeemSuccessBody(message: String) {
    Image(
        painter = painterResource(R.drawable.icon_success),
        contentDescription = null,
        modifier = Modifier.fillMaxWidth().height(Dimens.buttonHeight),
    )
    Text(
        text = stringResource(id = R.string.voucher_success_title),
        modifier =
            Modifier.padding(start = Dimens.smallPadding, top = Dimens.mediumPadding)
                .fillMaxWidth(),
        color = MaterialTheme.colorScheme.onSurface,
        style = MaterialTheme.typography.titleMedium,
    )

    Text(
        text = message,
        modifier =
            Modifier.padding(start = Dimens.smallPadding, top = Dimens.smallPadding).fillMaxWidth(),
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        style = MaterialTheme.typography.labelLarge,
    )
}

@Composable
private fun EnterVoucherBody(
    state: VoucherDialogUiState,
    onVoucherInputChange: (String) -> Unit,
    onRedeem: (voucherCode: String) -> Unit,
) {
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
        CustomTextField(
            value = state.voucherInput,
            keyboardType = KeyboardType.Password,
            modifier = Modifier.testTag(VOUCHER_INPUT_TEST_TAG),
            onValueChanged = { input -> onVoucherInputChange(input) },
            onSubmit = { input ->
                if (state.voucherInput.length == VOUCHER_LENGTH) {
                    onRedeem(input)
                }
            },
            placeholder = {
                Text(
                    text = stringResource(id = R.string.voucher_hint),
                    style = MaterialTheme.typography.titleMedium,
                )
            },
            isValidValue =
                state.voucherInput.isEmpty() || state.voucherInput.length == MAX_VOUCHER_LENGTH,
            isDigitsOnlyAllowed = false,
            visualTransformation = vouchersVisualTransformation(),
            textStyle = MaterialTheme.typography.titleMedium.copy(textDirection = TextDirection.Ltr),
        )
    }
    Spacer(modifier = Modifier.height(Dimens.smallPadding))
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.height(Dimens.listIconSize).fillMaxWidth(),
    ) {
        when (state.voucherState) {
            VoucherDialogState.Default,
            is VoucherDialogState.Success -> {
                // Do nothing
            }
            is VoucherDialogState.Error.DaemonError ->
                Text(
                    text = stringResource(id = state.voucherState.error.message()),
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                )
            VoucherDialogState.Error.NoInternet ->
                Text(
                    text = stringResource(id = R.string.no_internet_connection),
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                )
            VoucherDialogState.Verifying -> {
                MullvadCircularProgressIndicatorSmall()
                Text(
                    text = stringResource(id = R.string.verifying_voucher),
                    modifier = Modifier.padding(start = Dimens.smallPadding),
                    color = MaterialTheme.colorScheme.onSurface,
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
    if (
        state.voucherState is VoucherDialogState.Error.DaemonError &&
            state.voucherState.error is RedeemVoucherError.EnteredAccountNumber
    ) {
        Text(
            modifier = Modifier.padding(top = Dimens.smallPadding),
            text = stringResource(id = R.string.voucher_is_account_number),
            color = MaterialTheme.colorScheme.onPrimary,
            style = MaterialTheme.typography.bodySmall,
        )
    }
}

private fun RedeemVoucherError.message(): Int =
    when (this) {
        RedeemVoucherError.EnteredAccountNumber,
        RedeemVoucherError.InvalidVoucher -> R.string.invalid_voucher
        RedeemVoucherError.TooShortVoucher -> R.string.voucher_too_short
        RedeemVoucherError.VoucherAlreadyUsed -> R.string.voucher_already_used
        RedeemVoucherError.ApiUnreachable -> R.string.api_unreachable
        is RedeemVoucherError.Unknown -> R.string.error_occurred
    }
