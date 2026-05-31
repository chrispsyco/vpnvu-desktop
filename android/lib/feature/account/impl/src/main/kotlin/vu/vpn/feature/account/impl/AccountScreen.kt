package vu.vpn.feature.account.impl

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.DeleteForever
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.MoreVert
import androidx.compose.material.icons.automirrored.rounded.OpenInNew
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.unit.sp
import vu.vpn.lib.ui.theme.typeface.GeistMonoFontFamily
import androidx.compose.material3.MenuDefaults
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewParameter
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.Locale
import kotlinx.coroutines.launch
import vu.vpn.common.compose.CollectSideEffectWithLifecycle
import vu.vpn.common.compose.SecureScreenWhileInView
import vu.vpn.common.compose.createCopyToClipboardHandle
import vu.vpn.common.compose.createOpenAccountPageHook
import vu.vpn.common.compose.showSnackbarImmediately
import vu.vpn.core.Navigator
import vu.vpn.feature.addtime.api.VerificationPendingNavKey
import vu.vpn.feature.deleteaccount.api.DeleteAccountNavKey
import vu.vpn.feature.login.api.LoginNavKey
import vu.vpn.feature.managedevices.api.ManageDevicesNavKey
import vu.vpn.feature.redeemvoucher.api.RedeemVoucherNavKey
import vu.vpn.lib.common.Lc
import vu.vpn.lib.ui.component.CopyableObfuscationView
import vu.vpn.lib.ui.component.InformationView
import vu.vpn.lib.ui.component.MissingPolicy
import vu.vpn.lib.ui.component.ScaffoldWithSmallTopBar
import vu.vpn.lib.ui.component.button.NavigateCloseIconButton
import vu.vpn.lib.ui.component.drawVerticalScrollbar
import vu.vpn.lib.ui.designsystem.NegativeButton
import vu.vpn.lib.ui.designsystem.PrimaryTextButton
import vu.vpn.lib.ui.designsystem.VariantButton
import vu.vpn.lib.ui.tag.MANAGE_DEVICES_BUTTON_TEST_TAG
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.theme.color.AlphaDisabled
import vu.vpn.lib.ui.theme.color.AlphaScrollbar
import org.koin.androidx.compose.koinViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Preview("Loading|Content|LogoutLoading")
@Composable
private fun PreviewAccountScreen(
    @PreviewParameter(AccountUiStatePreviewParameterProvider::class) state: Lc<Unit, AccountUiState>
) {
    AppTheme {
        AccountScreen(
            state = state.contentOrNull(),
            snackbarHostState = SnackbarHostState(),
            onCopyAccountNumber = {},
            onManageDevicesClick = {},
            onLogoutClick = {},
            onPlayPaymentInfoClick = {},
            onBackClick = {},
            navigateToDeleteAccount = {},
            onBuyCreditClick = {},
            navigateToRedeemVoucher = {},
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Account(navigator: Navigator) {
    val vm = koinViewModel<AccountViewModel>()
    val state by vm.uiState.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }
    val copyTextString = stringResource(id = R.string.copied_mullvad_account_number)
    val errorString = stringResource(id = R.string.error_occurred)
    val copyToClipboard =
        createCopyToClipboardHandle(snackbarHostState = snackbarHostState, isSensitive = true)
    val openAccountPage = LocalUriHandler.current.createOpenAccountPageHook()

    CollectSideEffectWithLifecycle(vm.uiSideEffect) { sideEffect ->
        when (sideEffect) {
            AccountViewModel.UiSideEffect.NavigateToLogin -> {
                navigator.navigate(LoginNavKey(), clearBackStack = true)
            }
            is AccountViewModel.UiSideEffect.OpenAccountManagementPageInBrowser ->
                openAccountPage(sideEffect.token)
            is AccountViewModel.UiSideEffect.CopyAccountNumber ->
                launch { copyToClipboard(sideEffect.accountNumber, copyTextString) }
            AccountViewModel.UiSideEffect.GenericError ->
                snackbarHostState.showSnackbarImmediately(message = errorString)
        }
    }

    AccountScreen(
        state = state.contentOrNull(),
        snackbarHostState = snackbarHostState,
        onManageDevicesClick =
            dropUnlessResumed {
                state.contentOrNull()?.accountNumber?.let {
                    navigator.navigate(ManageDevicesNavKey(it))
                }
            },
        onLogoutClick = vm::onLogoutClick,
        onCopyAccountNumber = vm::onCopyAccountNumber,
        onPlayPaymentInfoClick =
            dropUnlessResumed { navigator.navigate(VerificationPendingNavKey) },
        onBackClick = dropUnlessResumed { navigator.goBack() },
        navigateToDeleteAccount = dropUnlessResumed { navigator.navigate(DeleteAccountNavKey) },
        onBuyCreditClick = vm::onBuyCreditClick,
        navigateToRedeemVoucher = dropUnlessResumed { navigator.navigate(RedeemVoucherNavKey) },
    )
}

@ExperimentalMaterial3Api
@Composable
fun AccountScreen(
    state: AccountUiState?,
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
    onCopyAccountNumber: (String) -> Unit,
    onManageDevicesClick: () -> Unit,
    onLogoutClick: () -> Unit,
    onPlayPaymentInfoClick: () -> Unit,
    onBackClick: () -> Unit,
    navigateToDeleteAccount: () -> Unit,
    onBuyCreditClick: () -> Unit,
    navigateToRedeemVoucher: () -> Unit,
) {
    // This will enable SECURE_FLAG while this screen is visible to preview screenshot
    SecureScreenWhileInView()

    ScaffoldWithSmallTopBar(
        appBarTitle = "Conta",
        navigationIcon = { NavigateCloseIconButton(onBackClick) },
        snackbarHostState = snackbarHostState,
        actions = { AccountDropdownMenu(navigateToDeleteAccount) },
    ) { modifier ->
        val scrollState = rememberScrollState()
        Column(
            horizontalAlignment = Alignment.Start,
            modifier =
                modifier
                    .drawVerticalScrollbar(
                        state = scrollState,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = AlphaScrollbar),
                    )
                    .verticalScroll(state = scrollState)
                    .animateContentSize()
                    .padding(horizontal = Dimens.sideMargin)
                    .padding(bottom = Dimens.screenBottomMargin),
        ) {
            // PSYCO · seções em cards com borda + kicker mono, batendo o Figma
            // (NÚMERO DA CONTA / TEMPO PAGO / DISPOSITIVOS).
            Column(
                verticalArrangement = Arrangement.spacedBy(Dimens.mediumPadding),
                modifier =
                    Modifier.padding(top = Dimens.smallPadding, bottom = Dimens.smallPadding)
                        .animateContentSize(),
            ) {
                // PSYCO · ordem batendo o desktop (AccountView.tsx):
                // Nome do dispositivo → Número da conta → Pago até.
                AccountCard {
                    SectionKicker(stringResource(id = R.string.device_name))
                    DeviceNameRow(
                        deviceName = state?.deviceName ?: "",
                        onManageDevicesClick = onManageDevicesClick,
                    )
                }

                AccountCard {
                    SectionKicker(stringResource(id = R.string.account_number))
                    AccountNumberRow(
                        accountNumber = state?.accountNumber?.value ?: "",
                        onCopyAccountNumber = onCopyAccountNumber,
                    )
                }

                AccountCard {
                    SectionKicker(stringResource(id = R.string.psyco_paid_until))
                    PaidUntilRow(
                        accountExpiry = state?.accountExpiry,
                        verificationPending = state?.verificationPending == true,
                        onInfoClick = onPlayPaymentInfoClick,
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // PSYCO · trio de botões batendo o desktop (AccountView.tsx):
            // "Comprar mais crédito" (verde/success + ícone external) ·
            // "Resgatar voucher" (verde/success) · "Encerrar sessão" (vermelho/destructive).
            Column(verticalArrangement = Arrangement.spacedBy(Dimens.buttonSpacing)) {
                VariantButton(
                    text = stringResource(id = R.string.buy_credit),
                    onClick = onBuyCreditClick,
                    modifier = Modifier.fillMaxWidth(),
                    icon = {
                        Icon(
                            imageVector = Icons.AutoMirrored.Rounded.OpenInNew,
                            contentDescription = null,
                        )
                    },
                )
                VariantButton(
                    text = stringResource(id = R.string.redeem_voucher),
                    onClick = navigateToRedeemVoucher,
                    modifier = Modifier.fillMaxWidth(),
                )
                NegativeButton(
                    text = stringResource(id = R.string.log_out),
                    onClick = onLogoutClick,
                    isLoading = state?.showLogoutLoading == true,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}

// PSYCO · card com borda arredondada + bg sutil, agrupando cada seção (Figma).
@Composable
private fun AccountCard(content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier =
            Modifier.fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .border(
                    width = 1.dp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.10f),
                    shape = RoundedCornerShape(16.dp),
                )
                .background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.04f))
                .padding(Dimens.mediumPadding),
        content = content,
    )
}

// PSYCO · kicker mono cinza usado como título de cada card.
@Composable
private fun SectionKicker(label: String) {
    Text(
        text = label.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        fontFamily = GeistMonoFontFamily,
        letterSpacing = 1.6.sp,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(bottom = Dimens.smallPadding),
    )
}

@Composable
private fun AccountDropdownMenu(navigateToDeleteAccount: () -> Unit) {
    var showMenu by remember { mutableStateOf(false) }

    IconButton(onClick = { showMenu = !showMenu }) {
        Icon(
            imageVector = Icons.Rounded.MoreVert,
            contentDescription = stringResource(id = R.string.psyco_more_actions),
        )
    }
    DropdownMenu(
        modifier = Modifier.background(MaterialTheme.colorScheme.tertiaryContainer),
        expanded = showMenu,
        onDismissRequest = { showMenu = false },
    ) {
        val colors =
            MenuDefaults.itemColors(
                leadingIconColor = MaterialTheme.colorScheme.onPrimary,
                disabledLeadingIconColor =
                    MaterialTheme.colorScheme.onPrimary.copy(alpha = AlphaDisabled),
            )

        DropdownMenuItem(
            text = { Text(text = stringResource(id = R.string.delete_account)) },
            onClick = {
                showMenu = false
                navigateToDeleteAccount()
            },
            colors = colors,
            leadingIcon = { Icon(Icons.Rounded.DeleteForever, contentDescription = null) },
        )
    }
}

@Composable
private fun DeviceNameRow(deviceName: String, onManageDevicesClick: () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth()) {
        // Device name is english so always provide LtR direction
        CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                InformationView(content = deviceName, whenMissing = MissingPolicy.SHOW_SPINNER)
                Spacer(modifier = Modifier.weight(1f))
                PrimaryTextButton(
                    modifier = Modifier.testTag(MANAGE_DEVICES_BUTTON_TEST_TAG),
                    onClick = onManageDevicesClick,
                    text = stringResource(id = R.string.manage_devices),
                    textDecoration = TextDecoration.Underline,
                )
            }
        }
    }
}

@Composable
private fun AccountNumberRow(accountNumber: String, onCopyAccountNumber: (String) -> Unit) {
    Column(modifier = Modifier.fillMaxWidth()) {
        // Always provide LtR direction since it is a number
        CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
            CopyableObfuscationView(
                content = accountNumber,
                onCopyClicked = { onCopyAccountNumber(accountNumber) },
                modifier = Modifier.heightIn(min = Dimens.accountRowMinHeight).fillMaxWidth(),
            )
        }
    }
}

@Composable
private fun PaidUntilRow(
    accountExpiry: ZonedDateTime?,
    verificationPending: Boolean,
    onInfoClick: () -> Unit,
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        if (accountExpiry == null) {
            Row(
                modifier = Modifier.heightIn(min = Dimens.accountRowMinHeight),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                InformationView(content = "", whenMissing = MissingPolicy.SHOW_SPINNER)
            }
        } else {
            RichExpiry(accountExpiry = accountExpiry)
        }

        if (verificationPending) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onInfoClick) {
                    Icon(
                        imageVector = Icons.Rounded.Info,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurface,
                    )
                }
                Text(
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface,
                    text = stringResource(id = R.string.payment_status_pending_short),
                )
            }
        }
    }
}

// PSYCO · "TEMPO PAGO" rico do Figma/desktop: número grande de tempo restante +
// unidade + chip de plano + barra de progresso (baseline anual 360 dias).
// Porta a lógica de desktop FormattedAccountExpiry pro Compose.
private enum class ExpiryTone {
    OK,
    WARNING,
    DANGER,
}

private val EXPIRY_DATE_FORMATTER: DateTimeFormatter =
    DateTimeFormatter.ofPattern("d 'de' MMM 'de' yyyy, HH:mm", Locale.forLanguageTag("pt-BR"))

// Returns a string-resource id for the expiry chip so the label follows the
// device locale (resolved by the @Composable caller).
private fun expiryChipLabel(tone: ExpiryTone, days: Long): Int =
    when {
        tone == ExpiryTone.DANGER -> R.string.psyco_expiry_expired
        tone == ExpiryTone.WARNING -> R.string.psyco_expiry_renew
        days >= 300 -> R.string.psyco_plan_annual
        days >= 80 -> R.string.psyco_plan_90days
        else -> R.string.psyco_plan_active
    }

// PSYCO · porta o renderRemainingLabel do desktop (FormattedAccountExpiry.tsx):
// >= 2 anos mostra em anos, >= ~2 meses em meses, senão em dias. Retorna o
// valor + o id da string da unidade (singular/plural), resolvido no @Composable.
private fun remainingValueUnit(days: Long): Pair<String, Int> {
    val d = maxOf(0L, days)
    return when {
        d >= 730 -> {
            val years = d / 365
            years.toString() to if (years == 1L) R.string.psyco_year_left else R.string.psyco_years_left
        }
        d >= 60 -> {
            val months = d / 30
            months.toString() to if (months == 1L) R.string.psyco_month_left else R.string.psyco_months_left
        }
        else -> d.toString() to if (d == 1L) R.string.psyco_day_left else R.string.psyco_days_left
    }
}

@Composable
private fun ColumnScope.RichExpiry(accountExpiry: ZonedDateTime) {
    val now = ZonedDateTime.now()
    val expired = accountExpiry.isBefore(now)
    val days = maxOf(0L, ChronoUnit.DAYS.between(now, accountExpiry))
    val tone =
        when {
            expired -> ExpiryTone.DANGER
            days <= 7 -> ExpiryTone.WARNING
            else -> ExpiryTone.OK
        }
    val toneColor =
        when (tone) {
            ExpiryTone.OK -> MaterialTheme.colorScheme.primary
            ExpiryTone.WARNING -> Color(0xFFE8AC2E)
            ExpiryTone.DANGER -> MaterialTheme.colorScheme.error
        }
    val fill = (days.toFloat() / 360f).coerceIn(0.02f, 1f)
    val (value, unitRes) = if (expired) "0" to R.string.psyco_days_left else remainingValueUnit(days)

    Row(
        modifier = Modifier.fillMaxWidth().padding(top = Dimens.smallPadding),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.Bottom) {
            Text(
                text = value,
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Text(
                text = stringResource(id = unitRes),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(start = Dimens.smallPadding, bottom = Dimens.miniPadding),
            )
        }
        Text(
            text = stringResource(id = expiryChipLabel(tone, days)).uppercase(),
            style = MaterialTheme.typography.labelSmall,
            fontFamily = GeistMonoFontFamily,
            letterSpacing = 1.sp,
            color = toneColor,
            modifier =
                Modifier.clip(RoundedCornerShape(8.dp))
                    .background(toneColor.copy(alpha = 0.16f))
                    .padding(horizontal = Dimens.smallPadding, vertical = Dimens.miniPadding),
        )
    }
    Text(
        text = accountExpiry.format(EXPIRY_DATE_FORMATTER),
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(top = Dimens.miniPadding),
    )
    Box(
        modifier =
            Modifier.fillMaxWidth()
                .padding(top = Dimens.smallPadding)
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))
    ) {
        Box(
            modifier =
                Modifier.fillMaxWidth(fill)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(3.dp))
                    .background(toneColor)
        )
    }
}
