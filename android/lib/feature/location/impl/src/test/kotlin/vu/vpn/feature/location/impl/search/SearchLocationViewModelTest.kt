package vu.vpn.feature.location.impl.search

import app.cash.turbine.test
import io.mockk.every
import io.mockk.mockk
import kotlin.test.assertIs
import kotlin.test.assertTrue
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.runTest
import vu.vpn.lib.common.Lce
import vu.vpn.lib.common.test.TestCoroutineRule
import vu.vpn.lib.common.test.assertLists
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.GeoLocationId
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.RelayItemSelection
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.model.Settings
import vu.vpn.lib.model.WireguardConstraints
import vu.vpn.lib.repository.RelayListFilterRepository
import vu.vpn.lib.repository.SettingsRepository
import vu.vpn.lib.repository.WireguardConstraintsRepository
import vu.vpn.lib.ui.component.relaylist.RelayListItem
import vu.vpn.lib.usecase.FilterChip
import vu.vpn.lib.usecase.FilterChipUseCase
import vu.vpn.lib.usecase.FilteredRelayListUseCase
import vu.vpn.lib.usecase.ModifyMultihopUseCase
import vu.vpn.lib.usecase.SelectSinglehopUseCase
import vu.vpn.lib.usecase.SelectedLocationUseCase
import vu.vpn.lib.usecase.customlists.CustomListActionUseCase
import vu.vpn.lib.usecase.customlists.CustomListsRelayItemUseCase
import vu.vpn.lib.usecase.customlists.FilterCustomListsRelayItemUseCase
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestCoroutineRule::class)
class SearchLocationViewModelTest {

    private val mockWireguardConstraintsRepository: WireguardConstraintsRepository = mockk()
    private val mockFilteredRelayListUseCase: FilteredRelayListUseCase = mockk()
    private val mockCustomListActionUseCase: CustomListActionUseCase = mockk()
    private val mockRelayListFilterRepository: RelayListFilterRepository = mockk()
    private val mockFilterChipUseCase: FilterChipUseCase = mockk()
    private val mockFilteredCustomListRelayItemsUseCase: FilterCustomListsRelayItemUseCase = mockk()
    private val mockSelectedLocationUseCase: SelectedLocationUseCase = mockk()
    private val mockCustomListsRelayItemUseCase: CustomListsRelayItemUseCase = mockk()
    private val mockSelectSinglehopUseCase: SelectSinglehopUseCase = mockk()
    private val mockModifyMultihopUseCase: ModifyMultihopUseCase = mockk()
    private val mockSettingsRepository: SettingsRepository = mockk()

    private val filteredRelayList = MutableStateFlow<List<RelayItem.Location.Country>>(emptyList())
    private val selectedLocation =
        MutableStateFlow<RelayItemSelection>(RelayItemSelection.Single(Constraint.Any))
    private val filteredCustomListRelayItems =
        MutableStateFlow<List<RelayItem.CustomList>>(emptyList())
    private val customListRelayItems = MutableStateFlow<List<RelayItem.CustomList>>(emptyList())
    private val filterChips = MutableStateFlow<List<FilterChip>>(emptyList())
    private val wireguardConstraints = MutableStateFlow<WireguardConstraints>(mockk(relaxed = true))
    private val settingsFlow = MutableStateFlow(mockk<Settings>(relaxed = true))

    private lateinit var viewModel: SearchLocationViewModel

    @BeforeEach
    fun setup() {
        every { mockFilteredRelayListUseCase(any()) } returns filteredRelayList
        every { mockSelectedLocationUseCase() } returns selectedLocation
        every { mockFilteredCustomListRelayItemsUseCase(any()) } returns
            filteredCustomListRelayItems
        every { mockCustomListsRelayItemUseCase() } returns customListRelayItems
        every { mockFilterChipUseCase(any()) } returns filterChips
        every { mockWireguardConstraintsRepository.wireguardConstraints } returns
            wireguardConstraints
        every { mockSettingsRepository.settingsUpdates } returns settingsFlow

        viewModel =
            SearchLocationViewModel(
                relayListType = RelayListType.Single,
                filteredRelayListUseCase = mockFilteredRelayListUseCase,
                customListActionUseCase = mockCustomListActionUseCase,
                relayListFilterRepository = mockRelayListFilterRepository,
                filterChipUseCase = mockFilterChipUseCase,
                filteredCustomListRelayItemsUseCase = mockFilteredCustomListRelayItemsUseCase,
                selectedLocationUseCase = mockSelectedLocationUseCase,
                customListsRelayItemUseCase = mockCustomListsRelayItemUseCase,
                selectSinglehopUseCase = mockSelectSinglehopUseCase,
                modifyMultihopUseCase = mockModifyMultihopUseCase,
                settingsRepository = mockSettingsRepository,
            )
    }

    @Test
    fun `on onSearchTermInput call uiState should emit with filtered countries`() = runTest {
        // Arrange
        val mockSearchString = "got"
        filteredRelayList.value = testCountries

        // Act, Assert
        viewModel.uiState.test {
            // Wait for first data
            awaitItem()

            // Update search string
            viewModel.onSearchInputUpdated(mockSearchString)

            val actualState = awaitItem()
            assertIs<Lce.Content<SearchLocationUiState>>(actualState)
            assertTrue(
                actualState.value.relayListItems
                    .filterIsInstance<RelayListItem.GeoLocationItem>()
                    .any { it.item is RelayItem.Location.City && it.item.name == "Gothenburg" }
            )
        }
    }

    @Test
    fun `when onSearchTermInput returns empty result uiState should return empty list`() = runTest {
        // Arrange
        filteredRelayList.value = testCountries
        val mockSearchString = "SEARCH"

        // Act, Assert
        viewModel.uiState.test {
            // Wait for first data
            awaitItem()

            // Update search string
            viewModel.onSearchInputUpdated(mockSearchString)

            // Assert
            val actualState = awaitItem()
            assertIs<Lce.Content<SearchLocationUiState>>(actualState)
            assertLists(
                listOf(RelayListItem.LocationsEmptyText(mockSearchString)),
                actualState.value.relayListItems,
            )
        }
    }

    companion object {
        private val testCountries =
            listOf(
                RelayItem.Location.Country(
                    id = GeoLocationId.Country("se"),
                    "Sweden",
                    listOf(
                        RelayItem.Location.City(
                            id = GeoLocationId.City(GeoLocationId.Country("se"), "got"),
                            "Gothenburg",
                            emptyList(),
                            countryName = "Sweden",
                        )
                    ),
                ),
                RelayItem.Location.Country(id = GeoLocationId.Country("no"), "Norway", emptyList()),
            )
    }
}
