package vu.vpn.feature.multihop.impl

import app.cash.turbine.test
import arrow.core.Either
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.runTest
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.test.TestCoroutineRule
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.HopSelection
import vu.vpn.lib.model.WireguardConstraints
import vu.vpn.lib.repository.WireguardConstraintsRepository
import vu.vpn.lib.usecase.HopSelectionUseCase
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestCoroutineRule::class)
class MultihopViewModelTest {

    private val mockWireguardConstraintsRepository: WireguardConstraintsRepository = mockk()
    private val mockHopSelectionUseCase: HopSelectionUseCase = mockk()

    private val wireguardConstraints = MutableStateFlow<WireguardConstraints>(mockk(relaxed = true))
    private val hopSelection = MutableStateFlow<HopSelection>(HopSelection.Single(null))

    private lateinit var multihopViewModel: MultihopViewModel

    @BeforeEach
    fun setUp() {
        every { mockWireguardConstraintsRepository.wireguardConstraints } returns
            wireguardConstraints
        every { mockHopSelectionUseCase() } returns hopSelection

        multihopViewModel =
            MultihopViewModel(
                isModal = false,
                wireguardConstraintsRepository = mockWireguardConstraintsRepository,
                hopSelectionUseCase = mockHopSelectionUseCase,
            )
    }

    @Test
    fun `default state should be multihop disabled`() {
        assertEquals(false, multihopViewModel.uiState.value.contentOrNull()?.enable == true)
    }

    @Test
    fun `when multihop enabled is true state should return multihop enabled true`() = runTest {
        // Arrange
        wireguardConstraints.value =
            WireguardConstraints(
                isMultihopEnabled = true,
                entryLocation = Constraint.Any,
                ipVersion = Constraint.Any,
            )
        hopSelection.value = HopSelection.Multi(entry = Constraint.Any, exit = Constraint.Any)

        // Act, Assert
        multihopViewModel.uiState.test {
            val item = awaitItem()
            assertIs<Lc.Content<MultihopUiState>>(item)
            assertEquals(
                MultihopUiState(enable = true, entry = Constraint.Any, exit = Constraint.Any),
                item.value,
            )
        }
    }

    @Test
    fun `when set multihop is called should call repository set multihop`() = runTest {
        // Arrange
        coEvery { mockWireguardConstraintsRepository.setMultihop(any()) } returns Either.Right(Unit)

        // Act
        multihopViewModel.setMultihop(true)

        // Assert
        coVerify { mockWireguardConstraintsRepository.setMultihop(true) }
    }
}
