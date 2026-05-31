package vu.vpn.feature.apiaccess.impl.screen.detail

import vu.vpn.lib.model.ApiAccessMethod
import vu.vpn.lib.model.ApiAccessMethodId
import vu.vpn.lib.model.ApiAccessMethodName
import vu.vpn.lib.model.ApiAccessMethodSetting

sealed interface ApiAccessMethodDetailsUiState {
    val apiAccessMethodId: ApiAccessMethodId

    data class Loading(override val apiAccessMethodId: ApiAccessMethodId) :
        ApiAccessMethodDetailsUiState

    data class Content(
        val apiAccessMethodSetting: ApiAccessMethodSetting,
        val isDisableable: Boolean,
        val isCurrentMethod: Boolean,
        val isTestingAccessMethod: Boolean,
    ) : ApiAccessMethodDetailsUiState {
        override val apiAccessMethodId: ApiAccessMethodId = apiAccessMethodSetting.id
        val isEditable: Boolean =
            apiAccessMethodSetting.apiAccessMethod is ApiAccessMethod.CustomProxy
        val name: ApiAccessMethodName = apiAccessMethodSetting.name
        val enabled: Boolean = apiAccessMethodSetting.enabled
        val apiAccessMethod: ApiAccessMethod = apiAccessMethodSetting.apiAccessMethod
    }

    fun canBeEdited() = this is Content && apiAccessMethod is ApiAccessMethod.CustomProxy

    fun testingAccessMethod() = this is Content && isTestingAccessMethod

    fun currentMethod() = this is Content && isCurrentMethod
}
