package vu.vpn.feature.account.impl

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import java.time.ZonedDateTime
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.WhileSubscribed
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterIsInstance
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.constant.VIEW_MODEL_STOP_TIMEOUT
import vu.vpn.lib.common.toLc
import vu.vpn.lib.model.AccountData
import vu.vpn.lib.model.AccountNumber
import vu.vpn.lib.model.DeviceState
import vu.vpn.lib.model.WebsiteAuthToken
import vu.vpn.lib.payment.util.hasPendingPayment
import vu.vpn.lib.payment.util.isSuccess
import vu.vpn.lib.repository.AccountRepository
import vu.vpn.lib.repository.DeviceRepository
import vu.vpn.lib.repository.PaymentLogic

class AccountViewModel(
    private val accountRepository: AccountRepository,
    deviceRepository: DeviceRepository,
    private val paymentUseCase: PaymentLogic,
) : ViewModel() {
    private val _uiSideEffect = Channel<UiSideEffect>()
    val uiSideEffect = _uiSideEffect.receiveAsFlow()

    private val isLoggingOut = MutableStateFlow(false)

    val uiState: StateFlow<Lc<Unit, AccountUiState>> =
        combine(
                deviceRepository.deviceState.filterIsInstance<DeviceState.LoggedIn>(),
                accountData(),
                paymentUseCase.paymentAvailability,
                isLoggingOut,
            ) { deviceState, accountData, paymentAvailability, isLoggingOut ->
                AccountUiState(
                        deviceName = deviceState.device.displayName(),
                        accountNumber = deviceState.accountNumber,
                        accountExpiry = accountData?.expiryDate,
                        showLogoutLoading = isLoggingOut,
                        verificationPending = paymentAvailability.hasPendingPayment(),
                    )
                    .toLc<Unit, AccountUiState>()
            }
            .onStart { viewModelScope.launch { updateAccountExpiry() } }
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(VIEW_MODEL_STOP_TIMEOUT),
                Lc.Loading(Unit),
            )

    init {
        verifyPurchases()
        fetchPaymentAvailability()
    }

    private fun accountData(): Flow<AccountData?> =
        // Ignore nulls expect first, to avoid loading when logging out.
        accountRepository.accountData
            .filterNotNull()
            .onStart<AccountData?> { emit(accountRepository.accountData.value) }
            .distinctUntilChanged()

    fun onLogoutClick() {
        if (isLoggingOut.value) return
        isLoggingOut.value = true

        viewModelScope.launch {
            accountRepository
                .logout()
                .also { isLoggingOut.value = false }
                .fold(
                    { _uiSideEffect.send(UiSideEffect.GenericError) },
                    { _uiSideEffect.send(UiSideEffect.NavigateToLogin) },
                )
        }
    }

    fun onCopyAccountNumber(accountNumber: String) {
        viewModelScope.launch { _uiSideEffect.send(UiSideEffect.CopyAccountNumber(accountNumber)) }
    }

    // PSYCO · "Comprar mais crédito" abre a página da conta no navegador (site payment),
    // espelhando o desktop (AccountView.tsx). Mantém a compra fora do app — o fork é
    // distribuído fora da Play Store, então não há fluxo de billing in-app a preservar.
    fun onBuyCreditClick() {
        viewModelScope.launch {
            val wwwAuthToken = accountRepository.getWebsiteAuthToken()
            _uiSideEffect.send(UiSideEffect.OpenAccountManagementPageInBrowser(wwwAuthToken))
        }
    }

    private fun updateAccountExpiry() {
        viewModelScope.launch { accountRepository.refreshAccountData() }
    }

    private fun verifyPurchases() {
        viewModelScope.launch {
            if (paymentUseCase.verifyPurchases().isSuccess()) {
                updateAccountExpiry()
            }
        }
    }

    private fun fetchPaymentAvailability() {
        viewModelScope.launch { paymentUseCase.queryPaymentAvailability() }
    }

    sealed class UiSideEffect {
        data object NavigateToLogin : UiSideEffect()

        data class OpenAccountManagementPageInBrowser(val token: WebsiteAuthToken?) : UiSideEffect()

        data class CopyAccountNumber(val accountNumber: String) : UiSideEffect()

        data object GenericError : UiSideEffect()
    }
}

data class AccountUiState(
    val deviceName: String,
    val accountNumber: AccountNumber,
    val accountExpiry: ZonedDateTime?,
    val showLogoutLoading: Boolean,
    val verificationPending: Boolean,
)
