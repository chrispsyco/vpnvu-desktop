package vu.vpn.feature.location.impl.list

import vu.vpn.lib.model.GeoLocationId
import vu.vpn.lib.model.RelayLatency
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.model.ServerTag
import vu.vpn.lib.ui.component.relaylist.RelayListItem

data class SelectLocationListUiState(
    val relayListType: RelayListType,
    val relayListItems: List<RelayListItem>,
    // Latency pill data, keyed by location id (country/city/relay). Defaulted so
    // preview providers and tests that don't care about pings stay untouched.
    val latencies: Map<GeoLocationId, RelayLatency> = emptyMap(),
    // STREAMING/PRIVACY badges, keyed by location id. Defaulted for previews/tests.
    val serverTags: Map<GeoLocationId, Set<ServerTag>> = emptyMap(),
)
