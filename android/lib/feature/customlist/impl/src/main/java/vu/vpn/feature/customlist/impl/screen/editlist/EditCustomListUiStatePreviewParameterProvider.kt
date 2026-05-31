package vu.vpn.feature.customlist.impl.screen.editlist

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.CustomListName
import vu.vpn.lib.model.GeoLocationId

class EditCustomListUiStatePreviewParameterProvider :
    PreviewParameterProvider<EditCustomListUiState> {
    override val values =
        sequenceOf(
            EditCustomListUiState.Content(
                id = CustomListId("id"),
                name = CustomListName.fromString("Custom list"),
                locations =
                    listOf(
                        GeoLocationId.Hostname(
                            GeoLocationId.City(GeoLocationId.Country("country"), code = "city"),
                            "hostname",
                        )
                    ),
            ),
            EditCustomListUiState.Loading,
            EditCustomListUiState.NotFound,
        )
}
