package vu.vpn.feature.customlist.impl.screen.lists

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import vu.vpn.lib.model.CustomList
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.CustomListName
import vu.vpn.lib.model.GeoLocationId

class CustomListsUiStatePreviewParameterProvider : PreviewParameterProvider<CustomListsUiState> {
    override val values =
        sequenceOf(
            CustomListsUiState.Content(
                customLists =
                    listOf(
                        CustomList(
                            id = CustomListId("list1"),
                            name = CustomListName.fromString("Custom List 1"),
                            locations =
                                listOf(
                                    GeoLocationId.Hostname(
                                        city =
                                            GeoLocationId.City(
                                                country = GeoLocationId.Country("se"),
                                                code = "code",
                                            ),
                                        code = "code",
                                    )
                                ),
                        ),
                        CustomList(
                            id = CustomListId("list2"),
                            name = CustomListName.fromString("Custom List 2"),
                            locations =
                                listOf(
                                    GeoLocationId.Hostname(
                                        city =
                                            GeoLocationId.City(
                                                country = GeoLocationId.Country("de"),
                                                code = "code",
                                            ),
                                        code = "code",
                                    )
                                ),
                        ),
                    )
            ),
            CustomListsUiState.Content(),
            CustomListsUiState.Loading,
        )
}
