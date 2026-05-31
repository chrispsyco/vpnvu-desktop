package vu.vpn.feature.home.impl.outoftime

import androidx.lifecycle.viewModelScope
import app.cash.turbine.test
import arrow.core.right
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import io.mockk.unmockkAll
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.runTest
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.test.TestCoroutineRule
import vu.vpn.lib.model.AccountData
import vu.vpn.lib.model.AccountNumber
import vu.vpn.lib.model.Device
import vu.vpn.lib.model.DeviceId
import vu.vpn.lib.model.DeviceState
import vu.vpn.lib.model.DisconnectReason
import vu.vpn.lib.model.TunnelState
import vu.vpn.lib.model.WebsiteAuthToken
import vu.vpn.lib.payment.model.PaymentAvailability
import vu.vpn.lib.payment.model.PaymentProduct
import vu.vpn.lib.payment.model.PaymentStatus
import vu.vpn.lib.payment.model.ProductId
import vu.vpn.lib.payment.model.ProductPrice
import vu.vpn.lib.payment.model.PurchaseResult
import vu.vpn.lib.repository.AccountRepository
import vu.vpn.lib.repository.ConnectionProxy
import vu.vpn.lib.repository.DeviceRepository
import vu.vpn.lib.repository.PaymentLogic
import vu.vpn.lib.usecase.OutOfTimeUseCase
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestCoroutineRule::class)
class OutOfTimeViewModelTest {

    private val accountExpiryStateFlow = MutableStateFlow<AccountData?>(null)
    private val accountStateFlow =
        MutableStateFlow<DeviceState?>(DeviceState.LoggedIn(AccountNumber(""), MOCK_DEVICE))
    private val paymentAvailabilityFlow = MutableStateFlow<PaymentAvailability?>(null)
    private val purchaseResultFlow = MutableStateFlow<PurchaseResult?>(null)
    private val outOfTimeFlow = MutableStateFlow(true)

    // Connection Proxy
    private val mockConnectionProxy: ConnectionProxy = mockk()

    // Event notifiers
    private val tunnelState = MutableStateFlow<TunnelState>(TunnelState.Disconnected())

    private val mockAccountRepository: AccountRepository = mockk(relaxed = true)
    private val mockDeviceRepository: DeviceRepository = mockk(relaxed = true)
    private val mockPaymentUseCase: PaymentLogic = mockk(relaxed = true)
    private val mockOutOfTimeUseCase: OutOfTimeUseCase = mockk(relaxed = true)

    private lateinit var viewModel: OutOfTimeViewModel

    @BeforeEach
    fun setup() {
        every { mockConnectionProxy.tunnelState } returns tunnelState

        every { mockAccountRepository.accountData } returns accountExpiryStateFlow

        every { mockDeviceRepository.deviceState } returns accountStateFlow

        coEvery { mockPaymentUseCase.purchaseResult } returns purchaseResultFlow

        coEvery { mockPaymentUseCase.paymentAvailability } returns paymentAvailabilityFlow

        coEvery { mockOutOfTimeUseCase.isOutOfTime } returns outOfTimeFlow

        viewModel =
            OutOfTimeViewModel(
                accountRepository = mockAccountRepository,
                deviceRepository = mockDeviceRepository,
                paymentUseCase = mockPaymentUseCase,
                outOfTimeUseCase = mockOutOfTimeUseCase,
                connectionProxy = mockConnectionProxy,
                pollAccountExpiry = false,
                isPlayBuild = false,
            )
    }

    @AfterEach
    fun tearDown() {
        viewModel.viewModelScope.coroutineContext.cancel()
        unmockkAll()
    }

    @Test
    fun `when clicking on site payment then open website account view`() = runTest {
        // Arrange
        val mockToken = WebsiteAuthToken.fromString("154c4cc94810fddac78398662b7fa0c7")
        coEvery { mockAccountRepository.getWebsiteAuthToken() } returns mockToken

        // Act, Assert
        viewModel.uiSideEffect.test {
            viewModel.onSitePaymentClick()
            val action = awaitItem()
            assertIs<OutOfTimeViewModel.UiSideEffect.OpenAccountView>(action)
            assertEquals(mockToken, action.token)
        }
    }

    @Test
    fun `when tunnel state changes then ui should be updated`() = runTest {
        // Arrange
        val tunnelRealStateTestItem = TunnelState.Connected(mockk(), mockk(), emptyList())

        // Act, Assert
        viewModel.uiState.test {
            // Default item
            awaitItem()
            tunnelState.emit(tunnelRealStateTestItem)
            val result = awaitItem()
            assertIs<Lc.Content<OutOfTimeUiState>>(result)
            assertEquals(tunnelRealStateTestItem, result.value.tunnelState)
        }
    }

    @Test
    fun `when OutOfTimeUseCase returns false uiSideEffect should emit OpenConnectScreen`() =
        runTest {
            // Act, Assert
            viewModel.uiSideEffect.test {
                outOfTimeFlow.value = false
                val action = awaitItem()
                assertIs<OutOfTimeViewModel.UiSideEffect.OpenConnectScreen>(action)
            }
        }

    @Test
    fun `onDisconnectClick should invoke disconnect on ConnectionProxy`() = runTest {
        // Arrange
        val mockDisconnectReason = DisconnectReason.USER_INITIATED_OUT_OF_TIME
        coEvery { mockConnectionProxy.disconnect(any()) } returns true.right()

        // Act
        viewModel.onDisconnectClick()

        // Assert
        coVerify { mockConnectionProxy.disconnect(mockDisconnectReason) }
    }

    @Test
    fun `when there is a pending purchase, uiState should reflect it`() = runTest {
        // Arrange
        paymentAvailabilityFlow.value =
            PaymentAvailability.ProductsAvailable(
                products =
                    listOf(
                        PaymentProduct(
                            productId = ProductId("test_product_id"),
                            price = ProductPrice("9.99"),
                            status = PaymentStatus.PENDING,
                        )
                    )
            )

        // Act, Assert
        viewModel.uiState.test {
            val result = awaitItem()
            assertIs<Lc.Content<OutOfTimeUiState>>(result)
            assertEquals(true, result.value.verificationPending)
        }
    }

    companion object {
        private val MOCK_DEVICE =
            Device(id = DeviceId.fromString(UUID), name = "Test Device", creationDate = mockk())
        private const val UUID = "12345678-1234-5678-1234-567812345678"
    }
}
