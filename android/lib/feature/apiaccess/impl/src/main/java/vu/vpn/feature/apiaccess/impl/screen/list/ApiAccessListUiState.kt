package vu.vpn.feature.apiaccess.impl.screen.list

import vu.vpn.lib.model.ApiAccessMethodSetting

data class ApiAccessListUiState(
    val currentApiAccessMethodSetting: ApiAccessMethodSetting? = null,
    val apiAccessMethodSettings: List<ApiAccessMethodSetting> = emptyList(),
)
