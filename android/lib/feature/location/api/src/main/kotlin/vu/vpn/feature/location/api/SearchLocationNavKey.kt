package vu.vpn.feature.location.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.RelayListType

@Parcelize data class SearchLocationNavKey(val relayListType: RelayListType) : NavKey2

@Parcelize data class SearchLocationNavResult(val relayListType: RelayListType) : NavResult
