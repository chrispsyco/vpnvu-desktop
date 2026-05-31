package vu.vpn.feature.home.impl.outoftime

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalResources
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewParameter
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.common.compose.CollectSideEffectWithLifecycle
import vu.vpn.common.compose.createOpenAccountPageHook
import vu.vpn.common.compose.showSnackbarImmediately
import vu.vpn.core.Navigator
import vu.vpn.feature.account.api.AccountNavKey
import vu.vpn.feature.addtime.api.AddTimeNavKey
import vu.vpn.feature.addtime.api.VerificationPendingNavKey
import vu.vpn.feature.home.api.ConnectNavKey
import vu.vpn.feature.redeemvoucher.api.RedeemVoucherNavKey
import vu.vpn.feature.settings.api.SettingsNavKey
import vu.vpn.lib.common.Lc
import vu.vpn.lib.ui.component.ScaffoldWithTopBarAndDeviceName
import vu.vpn.lib.ui.component.drawVerticalScrollbar
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorLarge
import vu.vpn.lib.ui.designsystem.NegativeButton
import vu.vpn.lib.ui.designsystem.PrimaryButton
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.tag.OUT_OF_TIME_SCREEN_TITLE_TEST_TAG
import vu.vpn.lib.ui.tag.PLAY_PAYMENT_INFO_ICON_TEST_TAG
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.theme.color.AlphaScrollbar
import vu.vpn.lib.ui.theme.color.positive
import vu.vpn.lib.ui.theme.typeface.GeistMonoFontFamily
import org.koin.androidx.compose.koinViewModel

@Preview("Disconnected|Connecting|Error|Loading")
@Composable
private fun PreviewOutOfTimeScreen(
    @PreviewParameter(OutOfTimeScreenPreviewParameterProvider::class)
    state: Lc<Unit, OutOfTimeUiState>
) {
    AppTheme {
        OutOfTimeScreen(
            state = state,
            snackbarHostState = SnackbarHostState(),
            onDisconnectClick = {},
            onSettingsClick = {},
            onAccountClick = {},
            onAddMoreTimeClick = {},
            onPlayPaymentInfoClick = {},
        )
    }
}

@Composable
fun OutOfTime(navigator: Navigator) {
    val vm = koinViewModel<OutOfTimeViewModel>()
    val state by vm.uiState.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }
    val resources = LocalResources.current
    val openAccountPage = LocalUriHandler.current.createOpenAccountPageHook()
    CollectSideEffectWithLifecycle(vm.uiSideEffect, Lifecycle.State.RESUMED) { uiSideEffect ->
        when (uiSideEffect) {
            is OutOfTimeViewModel.UiSideEffect.OpenAccountView ->
                openAccountPage(uiSideEffect.token)
            OutOfTimeViewModel.UiSideEffect.OpenConnectScreen ->
                navigator.navigate(ConnectNavKey, clearBackStack = true)
            OutOfTimeViewModel.UiSideEffect.GenericError ->
                snackbarHostState.showSnackbarImmediately(
                    message = resources.getString(R.string.error_occurred)
                )
        }
    }

    OutOfTimeScreen(
        state = state,
        snackbarHostState = snackbarHostState,
        onSettingsClick = dropUnlessResumed { navigator.navigate(SettingsNavKey) },
        onAccountClick = dropUnlessResumed { navigator.navigate(AccountNavKey) },
        onAddMoreTimeClick = dropUnlessResumed { navigator.navigate(AddTimeNavKey) },
        onPlayPaymentInfoClick =
            dropUnlessResumed { navigator.navigate(VerificationPendingNavKey) },
        onRedeemVoucherClick = dropUnlessResumed { navigator.navigate(RedeemVoucherNavKey) },
        onDisconnectClick = vm::onDisconnectClick,
    )
}

@Composable
fun OutOfTimeScreen(
    state: Lc<Unit, OutOfTimeUiState>,
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
    onDisconnectClick: () -> Unit,
    onSettingsClick: () -> Unit,
    onAccountClick: () -> Unit,
    onAddMoreTimeClick: () -> Unit,
    onPlayPaymentInfoClick: () -> Unit,
    onRedeemVoucherClick: () -> Unit = {},
) {
    val scrollState = rememberScrollState()
    ScaffoldWithTopBarAndDeviceName(
        snackbarHostState = snackbarHostState,
        topBarColor =
            if (state.contentOrNull()?.tunnelState?.isSecured() == true) {
                MaterialTheme.colorScheme.positive
            } else {
                MaterialTheme.colorScheme.error
            },
        iconTintColor =
            if (state.contentOrNull()?.tunnelState?.isSecured() == true) {
                MaterialTheme.colorScheme.onTertiary
            } else {
                MaterialTheme.colorScheme.onError
            },
        onSettingsClicked = onSettingsClick,
        onAccountClicked = onAccountClick,
        deviceName = state.contentOrNull()?.deviceName,
        timeLeft = null,
    ) {
        Column(
            modifier =
                Modifier.fillMaxSize()
                    .padding(it)
                    .padding(
                        top = Dimens.screenTopMargin,
                        start = Dimens.sideMargin,
                        end = Dimens.sideMargin,
                        bottom = Dimens.screenBottomMargin,
                    )
                    .verticalScroll(scrollState)
                    .drawVerticalScrollbar(
                        state = scrollState,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = AlphaScrollbar),
                    )
                    .background(color = MaterialTheme.colorScheme.surface)
        ) {
            when (state) {
                is Lc.Content -> {
                    Content()
                    Spacer(
                        modifier =
                            Modifier.weight(1f).defaultMinSize(minHeight = Dimens.verticalSpace)
                    )
                    // Button area
                    ButtonPanel(
                        state = state.value,
                        onDisconnectClick = onDisconnectClick,
                        onAddMoreTimeClick = onAddMoreTimeClick,
                        onInfoClick = onPlayPaymentInfoClick,
                        onRedeemVoucherClick = onRedeemVoucherClick,
                    )
                }
                is Lc.Loading -> {
                    Loading()
                }
            }
        }
    }
}

@Composable
private fun ColumnScope.Content() {
    Image(
        painter = painterResource(id = R.drawable.icon_fail),
        contentDescription = null,
        modifier =
            Modifier.align(Alignment.CenterHorizontally).padding(bottom = Dimens.mediumSpacer),
    )
    // PSYCO · kicker negativo eyebrow (vermelho · Geist Mono) espelhando o
    // .oot-hero__kicker do Figma ($variant="negative"), acima do título.
    Text(
        text = "TEMPO EXPIRADO",
        style = MaterialTheme.typography.labelSmall,
        fontFamily = GeistMonoFontFamily,
        letterSpacing = 2.sp,
        color = MaterialTheme.colorScheme.error,
        modifier = Modifier.padding(bottom = Dimens.smallPadding),
    )
    Text(
        text = "Sua conta acabou. Renove pra voltar a navegar.",
        style = MaterialTheme.typography.headlineSmall,
        color = MaterialTheme.colorScheme.onSurface,
        modifier = Modifier.testTag(OUT_OF_TIME_SCREEN_TITLE_TEST_TAG),
    )
    Text(
        text =
            buildAnnotatedString {
                append("Sua privacidade ")
                withStyle(SpanStyle(fontWeight = FontWeight.SemiBold)) {
                    append("não tá protegida")
                }
                append(
                    " agora. Sem VPN ativa, seu provedor vê tudo que você acessa. " +
                        "Renove em segundos."
                )
            },
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurface,
        modifier = Modifier.padding(top = Dimens.mediumPadding),
    )
}

@Composable
private fun ButtonPanel(
    state: OutOfTimeUiState,
    onDisconnectClick: () -> Unit,
    onAddMoreTimeClick: () -> Unit,
    onInfoClick: () -> Unit,
    onRedeemVoucherClick: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(Dimens.buttonSpacing)) {
        if (state.tunnelState.isSecured()) {
            NegativeButton(onClick = onDisconnectClick, text = "Desconectar")
        }
        if (state.verificationPending) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(
                    onClick = onInfoClick,
                    modifier = Modifier.testTag(PLAY_PAYMENT_INFO_ICON_TEST_TAG),
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Info,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurface,
                    )
                }
                Text(
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface,
                    text = "Pagamento do Google Play pendente",
                )
            }
        }
        // PSYCO · CTA primário cyan + seta · espelha o "Adicionar tempo agora →" do Figma.
        PrimaryButton(
            onClick = onAddMoreTimeClick,
            text = "Adicionar tempo agora",
            trailingIcon = {
                Icon(imageVector = Icons.AutoMirrored.Rounded.ArrowForward, contentDescription = null)
            },
        )
        // PSYCO · ação secundária em outline neutro · "Resgatar voucher" do Figma.
        OutlinedButton(
            onClick = onRedeemVoucherClick,
            modifier = Modifier.fillMaxWidth(),
            colors =
                ButtonDefaults.outlinedButtonColors(
                    contentColor = MaterialTheme.colorScheme.onSurface
                ),
            border =
                BorderStroke(
                    width = Dimens.outLineButtonBorderWidth,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                ),
        ) {
            Text(text = "Resgatar voucher", style = MaterialTheme.typography.titleMedium)
        }
    }
}

@Composable
private fun ColumnScope.Loading() {
    MullvadCircularProgressIndicatorLarge(
        modifier =
            Modifier.align(Alignment.CenterHorizontally).padding(vertical = Dimens.smallPadding)
    )
}
