package vu.vpn.feature.location.impl

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.lifecycle.viewModelScope
import app.cash.turbine.test
import arrow.core.right
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import vu.vpn.feature.location.api.LocationBottomSheetNavResult
import vu.vpn.feature.location.api.LocationBottomSheetState
import vu.vpn.feature.location.impl.bottomsheet.LocationBottomSheetViewModel
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.test.TestCoroutineRule
import vu.vpn.lib.common.util.relaylist.descendants
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.CustomList
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.CustomListName
import vu.vpn.lib.model.GeoLocationId
import vu.vpn.lib.model.HopSelection
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.RelayItemSelection
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.model.Settings
import vu.vpn.lib.model.WireguardConstraints
import vu.vpn.lib.model.communication.CustomListAction
import vu.vpn.lib.model.communication.CustomListActionResultData
import vu.vpn.lib.model.communication.LocationsChanged
import vu.vpn.lib.repository.ConnectionProxy
import vu.vpn.lib.repository.CustomListsRepository
import vu.vpn.lib.repository.RelayListRepository
import vu.vpn.lib.repository.SettingsRepository
import vu.vpn.lib.repository.WireguardConstraintsRepository
import vu.vpn.lib.ui.component.relaylist.generateRelayItemCountry
import vu.vpn.lib.usecase.FilterChip
import vu.vpn.lib.usecase.FilterChipUseCase
import vu.vpn.lib.usecase.HopSelectionUseCase
import vu.vpn.lib.usecase.ModifyAndEnableMultihopUseCase
import vu.vpn.lib.usecase.ModifyMultihopUseCase
import vu.vpn.lib.usecase.RelayItemCanBeSelectedUseCase
import vu.vpn.lib.usecase.SelectAndEnableMultihopUseCase
import vu.vpn.lib.usecase.SelectedLocationUseCase
import vu.vpn.lib.usecase.ValidSelection
import vu.vpn.lib.usecase.customlists.CustomListActionUseCase
import vu.vpn.lib.usecase.customlists.CustomListsRelayItemUseCase
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@OptIn(ExperimentalMaterial3Api::class)
@ExtendWith(TestCoroutineRule::class)
class LocationBottomSheetViewModelTest {

    private val mockCustomListActionUseCase: CustomListActionUseCase = mockk(relaxed = true)
    private val mockCustomListsRepository: CustomListsRepository = mockk(relaxed = true)
    private val mockRelayListRepository: RelayListRepository = mockk()
    private val mockWireguardConstraintsRepository: WireguardConstraintsRepository = mockk()
    private val mockFilterChipUseCase: FilterChipUseCase = mockk()
    private val mockSettingsRepository: SettingsRepository = mockk()
    private val mockSelectedLocationUseCase: SelectedLocationUseCase = mockk()
    private val mockModifyMultihopUseCase: ModifyMultihopUseCase = mockk()
    private val mockModifyAndEnableMultihopUseCase: ModifyAndEnableMultihopUseCase = mockk()
    private val mockSelectAndEnableMultihopUseCase: SelectAndEnableMultihopUseCase = mockk()
    private val mockHopSelectionUseCase: HopSelectionUseCase = mockk()
    private val mockRelayItemCanBeSelectedUseCase: RelayItemCanBeSelectedUseCase = mockk()
    private val mockCustomListsRelayItemUseCase: CustomListsRelayItemUseCase = mockk()
    private val mockConnectionProxy: ConnectionProxy = mockk()

    private val mockLocationBottomSheetState: LocationBottomSheetState =
        LocationBottomSheetState.ShowLocationBottomSheet(
            item =
                generateRelayItemCountry(
                    name = "Country",
                    cityNames = listOf("City"),
                    relaysPerCity = 2,
                    active = true,
                ),
            relayListType = RelayListType.Single,
        )

    private lateinit var viewModel: LocationBottomSheetViewModel

    private val customListRelayItems = MutableStateFlow<List<RelayItem.CustomList>>(emptyList())
    private val selectedRelayItemFlow = MutableStateFlow<HopSelection>(HopSelection.Single(null))
    private val wireguardConstraints = MutableStateFlow<WireguardConstraints>(mockk(relaxed = true))
    private val filterChips = MutableStateFlow<List<FilterChip>>(emptyList())
    private val relayList = MutableStateFlow<List<RelayItem.Location.Country>>(emptyList())
    private val settings = MutableStateFlow<Settings>(mockk(relaxed = true))
    private val validSelectionFlow =
        MutableStateFlow<ValidSelection>(ValidSelection.OnlyEntry(emptySet()))
    private val selectedLocation =
        MutableStateFlow<RelayItemSelection>(RelayItemSelection.Single(Constraint.Any))

    @BeforeEach
    fun setup() {

        every { mockWireguardConstraintsRepository.wireguardConstraints } returns
            wireguardConstraints
        every { mockFilterChipUseCase(any()) } returns filterChips
        every { mockRelayListRepository.relayList } returns relayList
        every { mockSettingsRepository.settingsUpdates } returns settings
        every { mockConnectionProxy.tunnelState } returns flowOf(mockk())
        every { mockHopSelectionUseCase() } returns selectedRelayItemFlow
        every { mockRelayItemCanBeSelectedUseCase(any()) } returns validSelectionFlow
        every { mockCustomListsRelayItemUseCase() } returns customListRelayItems
        every { mockSelectedLocationUseCase() } returns selectedLocation

        mockkStatic(RELAY_LIST_EXTENSIONS)
        mockkStatic(RELAY_ITEM_EXTENSIONS)
        mockkStatic(CUSTOM_LIST_EXTENSIONS)
        viewModel =
            LocationBottomSheetViewModel(
                locationBottomSheetState = mockLocationBottomSheetState,
                customListActionUseCase = mockCustomListActionUseCase,
                customListsRepository = mockCustomListsRepository,
                hopSelectionUseCase = mockHopSelectionUseCase,
                modifyMultihopUseCase = mockModifyMultihopUseCase,
                modifyAndEnableMultihopUseCase = mockModifyAndEnableMultihopUseCase,
                selectAndEnableMultihopUseCase = mockSelectAndEnableMultihopUseCase,
                wireguardConstraintsRepository = mockWireguardConstraintsRepository,
                canBeSelectedUseCase = mockRelayItemCanBeSelectedUseCase,
                customListsRelayItemUseCase = mockCustomListsRelayItemUseCase,
                selectedLocationUseCase = mockSelectedLocationUseCase,
            )
    }

    @AfterEach
    fun teardown() {
        viewModel.viewModelScope.coroutineContext.cancel()
        unmockkAll()
    }

    @Test
    fun `initial state should be correct`() = runTest {
        assertIs<Lc.Loading<Unit>>(viewModel.uiState.value)
    }

    @Test
    fun `after adding a location to a list should emit location added side effect`() = runTest {
        // Arrange
        val customListId = CustomListId("1")
        val addedLocationsId = GeoLocationId.Country("se")
        val customListName = CustomListName.fromString("custom")
        val location: RelayItem.Location.Country = mockk {
            every { id } returns GeoLocationId.Country("se")
            every { name } returns "Sweden"
            every { descendants() } returns emptyList()
        }
        val customList =
            RelayItem.CustomList(
                customList =
                    CustomList(
                        id = CustomListId("1"),
                        name = customListName,
                        locations = emptyList(),
                    ),
                locations = emptyList(),
            )
        val expectedResult =
            CustomListActionResultData.Success.LocationAdded(
                customListName = customListName,
                locationName = location.name,
                undo = CustomListAction.UpdateLocations(id = customListId, locations = emptyList()),
            )

        coEvery { mockCustomListActionUseCase(any<CustomListAction.UpdateLocations>()) } returns
            LocationsChanged(
                    id = customListId,
                    name = customListName,
                    locations = listOf(addedLocationsId),
                    oldLocations = emptyList(),
                )
                .right()

        // Act, Assert
        viewModel.uiSideEffect.test {
            viewModel.addLocationToList(item = location, customList = customList)
            val sideEffect = awaitItem()
            assertIs<LocationBottomSheetNavResult.CustomListActionToast>(sideEffect)
            assertEquals(expectedResult, sideEffect.resultData)
        }
    }

    @Test
    fun `after removing a location from a list should emit location removed side effect`() =
        runTest {
            // Arrange
            val locationName = "Sweden"
            val customListId = CustomListId("1")
            val removedLocationsId = GeoLocationId.Country("se")
            val customListName = CustomListName.fromString("custom")
            val location: RelayItem.Location.Country = mockk {
                every { id } returns removedLocationsId
                every { name } returns locationName
                every { descendants() } returns emptyList()
            }
            val expectedResult =
                CustomListActionResultData.Success.LocationRemoved(
                    customListName = customListName,
                    locationName = locationName,
                    undo =
                        CustomListAction.UpdateLocations(
                            id = customListId,
                            locations = listOf(location.id),
                        ),
                )
            coEvery { mockCustomListActionUseCase(any<CustomListAction.UpdateLocations>()) } returns
                LocationsChanged(
                        id = customListId,
                        name = customListName,
                        locations = emptyList(),
                        oldLocations = listOf(removedLocationsId),
                    )
                    .right()
            coEvery { mockCustomListsRepository.getCustomListById(customListId) } returns
                CustomList(
                        id = customListId,
                        name = customListName,
                        locations = listOf(removedLocationsId),
                    )
                    .right()

            // Act, Assert
            viewModel.uiSideEffect.test {
                viewModel.removeLocationFromList(item = location, customListId = customListId)
                val sideEffect = awaitItem()
                assertIs<LocationBottomSheetNavResult.CustomListActionToast>(sideEffect)
                assertEquals(expectedResult, sideEffect.resultData)
            }
        }

    companion object {
        private const val RELAY_LIST_EXTENSIONS =
            "vu.vpn.lib.common.util.relaylist.RelayListExtensionsKt"
        private const val RELAY_ITEM_EXTENSIONS =
            "vu.vpn.lib.common.util.relaylist.RelayItemExtensionsKt"
        private const val CUSTOM_LIST_EXTENSIONS =
            "vu.vpn.lib.common.util.relaylist.CustomListExtensionsKt"
    }
}
