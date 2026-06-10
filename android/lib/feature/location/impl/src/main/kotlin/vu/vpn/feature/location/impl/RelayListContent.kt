package vu.vpn.feature.location.impl

import vu.vpn.lib.ui.resource.R

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyItemScope
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.unit.sp
import vu.vpn.lib.ui.theme.typeface.GeistMonoFontFamily
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import vu.vpn.feature.location.api.LocationBottomSheetState
import vu.vpn.lib.model.CustomListId
import vu.vpn.lib.model.GeoLocationId
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.RelayItemId
import vu.vpn.lib.model.RelayLatency
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.ui.component.relaylist.RelayListItem
import vu.vpn.lib.ui.component.relaylist.SelectableRelayListItem
import vu.vpn.lib.ui.component.text.ListItemInfo
import vu.vpn.lib.ui.designsystem.Hierarchy
import vu.vpn.lib.ui.designsystem.ListHeader
import vu.vpn.lib.ui.designsystem.Position
import vu.vpn.lib.ui.tag.LOCATION_CELL_TEST_TAG
import vu.vpn.lib.ui.tag.RECENT_CELL_TEST_TAG
import vu.vpn.lib.ui.tag.SELECT_LOCATION_CUSTOM_LIST_HEADER_TEST_TAG
import vu.vpn.lib.ui.theme.Dimens

/** Used by both the select location screen and search select location screen */
fun LazyListScope.relayListContent(
    relayListItems: List<RelayListItem>,
    relayListType: RelayListType,
    onSelectRelayItem: (RelayItem) -> Unit,
    onToggleExpand: (RelayItemId, CustomListId?, Boolean) -> Unit,
    onUpdateBottomSheetState: (LocationBottomSheetState) -> Unit,
    latencyFor: (GeoLocationId) -> RelayLatency? = { null },
    customListHeader:
        @Composable
        (LazyItemScope.(listItem: RelayListItem.CustomListHeader) -> Unit) =
        {},
    locationHeader: @Composable (LazyItemScope.() -> Unit) = { RelayLocationHeader() },
) {
    items(
        items = relayListItems,
        key = { item: RelayListItem -> item.key },
        contentType = { item: RelayListItem -> item.contentType },
        itemContent = { listItem: RelayListItem ->
            Column(modifier = Modifier.animateItem()) {
                when (listItem) {
                    is RelayListItem.CustomListHeader -> customListHeader(listItem)
                    is RelayListItem.CustomListItem ->
                        CustomListItem(
                            listItem = listItem,
                            relayListType = relayListType,
                            onSelect = onSelectRelayItem,
                            onToggleExpand = onToggleExpand,
                            onUpdateBottomSheetState = onUpdateBottomSheetState,
                        )
                    is RelayListItem.CustomListEntryItem ->
                        CustomListEntryItem(
                            listItem = listItem,
                            relayListType = relayListType,
                            onSelect = onSelectRelayItem,
                            onToggleExpand = onToggleExpand,
                            onUpdateBottomSheetState = onUpdateBottomSheetState,
                        )
                    is RelayListItem.CustomListFooter -> CustomListFooter(listItem)
                    RelayListItem.LocationHeader -> locationHeader()
                    is RelayListItem.GeoLocationItem ->
                        GeoLocationItem(
                            listItem = listItem,
                            relayListType = relayListType,
                            latency = listItem.item.geoId()?.let(latencyFor),
                            onSelect = onSelectRelayItem,
                            onToggleExpand = onToggleExpand,
                            onUpdateBottomSheetState = onUpdateBottomSheetState,
                        )

                    RelayListItem.RecentsListHeader -> RecentsListHeader()
                    is RelayListItem.RecentListItem ->
                        RecentListItem(
                            listItem = listItem,
                            relayListType = relayListType,
                            latency = listItem.item.geoId()?.let(latencyFor),
                            onSelect = onSelectRelayItem,
                            onUpdateBottomSheetState = onUpdateBottomSheetState,
                        )
                    RelayListItem.RecentsListFooter -> RecentsListFooter()
                    is RelayListItem.EmptyRelayList -> EmptyRelayListText()
                    is RelayListItem.LocationsEmptyText -> LocationsEmptyText(listItem.searchTerm)
                    is RelayListItem.SectionDivider -> SectionDivider()
                }
            }
        },
    )
}

@Composable
private fun LocationsEmptyText(searchTerm: String) {
    Text(
        text = stringResource(R.string.search_no_matches_for_text, searchTerm),
        style = MaterialTheme.typography.bodyMedium,
        textAlign = TextAlign.Center,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        maxLines = 2,
        overflow = TextOverflow.Ellipsis,
        modifier = Modifier.padding(Dimens.cellVerticalSpacing),
    )
}

@Composable
fun Modifier.positionalPadding(itemPosition: Position): Modifier =
    when (itemPosition) {
        Position.Top,
        Position.Single -> padding(top = Dimens.miniPadding)
        Position.Middle -> padding(top = Dimens.listItemDivider)
        Position.Bottom -> padding(top = Dimens.listItemDivider, bottom = Dimens.miniPadding)
    }

@Composable
private fun GeoLocationItem(
    listItem: RelayListItem.GeoLocationItem,
    relayListType: RelayListType,
    latency: RelayLatency?,
    onSelect: (RelayItem) -> Unit,
    onToggleExpand: (RelayItemId, CustomListId?, Boolean) -> Unit,
    onUpdateBottomSheetState: (LocationBottomSheetState) -> Unit,
) {
    RichRelayRow(
        name = listItem.item.displayNameInline(),
        countryCode = listItem.item.geoCountryCode(),
        subtitle = listItem.item.locationSubtitle(),
        selected = listItem.isSelected,
        active = listItem.item.active,
        canExpand = listItem.canExpand,
        expanded = listItem.expanded,
        latency = latency,
        position = listItem.itemPosition,
        hierarchy = listItem.hierarchy,
        modifier = Modifier.positionalPadding(listItem.itemPosition).testTag(LOCATION_CELL_TEST_TAG),
        onClick = { onSelect(listItem.item) },
        onLongClick = {
            onUpdateBottomSheetState(
                LocationBottomSheetState.ShowLocationBottomSheet(
                    item = listItem.item,
                    relayListType = relayListType,
                )
            )
        },
        onToggleExpand = { onToggleExpand(listItem.item.id, null, it) },
    )
}

@Composable
private fun RecentListItem(
    listItem: RelayListItem.RecentListItem,
    relayListType: RelayListType,
    latency: RelayLatency?,
    onSelect: (RelayItem) -> Unit,
    onUpdateBottomSheetState: (LocationBottomSheetState) -> Unit,
) {
    RichRelayRow(
        name = listItem.item.displayNameInline(),
        countryCode = listItem.item.geoCountryCode(),
        subtitle = listItem.item.locationSubtitle(),
        selected = listItem.isSelected,
        active = listItem.item.active,
        canExpand = false,
        expanded = false,
        latency = latency,
        position = listItem.itemPosition,
        hierarchy = Hierarchy.Parent,
        modifier = Modifier.positionalPadding(listItem.itemPosition).testTag(RECENT_CELL_TEST_TAG),
        onClick = { onSelect(listItem.item) },
        onLongClick = {
            when (val entry = listItem.item) {
                is RelayItem.CustomList ->
                    onUpdateBottomSheetState(
                        LocationBottomSheetState.ShowEditCustomListBottomSheet(
                            item = entry,
                            relayListType = relayListType,
                        )
                    )
                is RelayItem.Location ->
                    onUpdateBottomSheetState(
                        LocationBottomSheetState.ShowLocationBottomSheet(
                            item = entry,
                            relayListType = relayListType,
                        )
                    )
            }
        },
    )
}

/**
 * PSYCO · país com EXATAMENTE 1 cidade mostra "País · Cidade" inline no nome
 * (ex.: "Brasil · São Paulo"), evitando ter que expandir pra ver o único
 * servidor. País com várias cidades, ou City/Relay/CustomList: nome normal.
 */
private fun RelayItem.displayNameInline(): String =
    if (this is RelayItem.Location.Country) {
        cities.singleOrNull()?.let { "$name · ${it.name}" } ?: name
    } else {
        name
    }

/** Two-letter country code for the avatar tile, or null for custom lists. */
private fun RelayItem.geoCountryCode(): String? =
    when (this) {
        is RelayItem.Location.Country -> id.code
        is RelayItem.Location.City -> id.country.code
        is RelayItem.Location.Relay -> id.city.country.code
        is RelayItem.CustomList -> null
    }

/** GeoLocationId for latency lookup, or null for custom lists (no ping). */
private fun RelayItem.geoId(): GeoLocationId? = (this as? RelayItem.Location)?.id

@Composable
private fun RelayItem.locationSubtitle(): String? =
    when (this) {
        is RelayItem.Location.Relay ->
            stringResource(R.string.country_comma_city, countryName, cityName)
        is RelayItem.Location.City -> countryName
        // PSYCO · país com 1 cidade mostra "País · Cidade" inline no NOME (ver
        // displayNameInline); subtítulo fica null pra não duplicar.
        is RelayItem.Location.Country -> null
        is RelayItem.CustomList -> null
    }

@Composable
private fun CustomListItem(
    listItem: RelayListItem.CustomListItem,
    relayListType: RelayListType,
    onSelect: (RelayItem) -> Unit,
    onToggleExpand: (RelayItemId, CustomListId?, Boolean) -> Unit,
    onUpdateBottomSheetState: (LocationBottomSheetState) -> Unit,
) {
    SelectableRelayListItem(
        relayListItem = listItem,
        onClick = { onSelect(listItem.item) },
        onLongClick = {
            onUpdateBottomSheetState(
                LocationBottomSheetState.ShowEditCustomListBottomSheet(
                    item = listItem.item,
                    relayListType = relayListType,
                )
            )
        },
        onToggleExpand = { onToggleExpand(listItem.item.id, null, it) },
        modifier = Modifier.positionalPadding(listItem.itemPosition),
    )
}

@Composable
private fun CustomListEntryItem(
    listItem: RelayListItem.CustomListEntryItem,
    relayListType: RelayListType,
    onSelect: (RelayItem) -> Unit,
    onToggleExpand: (RelayItemId, CustomListId?, Boolean) -> Unit,
    onUpdateBottomSheetState: (LocationBottomSheetState) -> Unit,
) {
    SelectableRelayListItem(
        relayListItem = listItem,
        onClick = { onSelect(listItem.item) },
        // Only direct children can be removed
        onLongClick =
            if (listItem.hierarchy == Hierarchy.Child1) {
                {
                    onUpdateBottomSheetState(
                        LocationBottomSheetState.ShowCustomListsEntryBottomSheet(
                            customListId = listItem.parentId,
                            item = listItem.item,
                            relayListType = relayListType,
                        )
                    )
                }
            } else {
                null
            },
        onToggleExpand = { expand: Boolean ->
            onToggleExpand(listItem.item.id, listItem.parentId, expand)
        },
        modifier = Modifier.positionalPadding(listItem.itemPosition),
    )
}

@Composable
fun CustomListHeader(addCustomList: () -> Unit, editCustomLists: (() -> Unit)?) {
    ListHeader(
        { PsycoKickerText(label = stringResource(id = R.string.psyco_custom_lists)) },
        actions = {
            IconButton(onClick = addCustomList) {
                Icon(
                    imageVector = Icons.Rounded.Add,
                    contentDescription = stringResource(id = R.string.new_list),
                )
            }
            editCustomLists?.run {
                IconButton(onClick = editCustomLists) {
                    Icon(
                        imageVector = Icons.Rounded.Edit,
                        contentDescription = stringResource(id = R.string.edit_lists),
                    )
                }
            }
        },
        modifier = Modifier.testTag(SELECT_LOCATION_CUSTOM_LIST_HEADER_TEST_TAG),
    )
}

@Composable
private fun CustomListFooter(item: RelayListItem.CustomListFooter) {
    ListItemInfo(
        text =
            if (item.hasCustomList) {
                stringResource(id = R.string.psyco_relaylist_no_lists_hint)
            } else {
                "Pra criar uma lista personalizada, toque no \"+\"."
            }
    )
}

@Composable
private fun RelayLocationHeader() {
    ListHeader(content = { PsycoKickerText(label = stringResource(id = R.string.psyco_all_locations)) })
}

@Composable
private fun RecentsListHeader() {
    ListHeader(content = { PsycoKickerText(label = stringResource(id = R.string.psyco_recent)) })
}

// PSYCO · kicker eyebrow cyan uppercase pra section headers internos da relay list ·
// renderizado dentro do `ListHeader` do design system pra preservar o layout
// (actions ao lado), mas com tipografia/cor de "section header" do reskin.
@Composable
private fun PsycoKickerText(label: String) {
    Text(
        text = label.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        fontFamily = GeistMonoFontFamily,
        letterSpacing = 1.6.sp,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        overflow = TextOverflow.Ellipsis,
    )
}

@Composable
private fun RecentsListFooter() {
    ListItemInfo(text = stringResource(id = R.string.psyco_no_recent_selections))
}

@Composable
private fun SectionDivider() {
    Spacer(modifier = Modifier.height(Dimens.cellVerticalSpacing))
}
