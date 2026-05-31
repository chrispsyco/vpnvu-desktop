package vu.vpn.feature.location.impl

import kotlinx.coroutines.channels.Channel
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.RelayListType

typealias ScrollEvent = Pair<RelayListType, RelayItem>

class RelayListScrollConnection {
    val scrollEvents: Channel<ScrollEvent> = Channel()
}
