package vu.vpn.feature.settings.impl

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.WhileSubscribed
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.constant.VIEW_MODEL_STOP_TIMEOUT
import vu.vpn.lib.common.toLc
import vu.vpn.lib.model.DeviceState
import vu.vpn.lib.repository.AppVersionInfoRepository
import vu.vpn.lib.repository.DeviceRepository
import vu.vpn.lib.repository.SettingsRepository
import vu.vpn.lib.repository.WireguardConstraintsRepository

class SettingsViewModel(
    deviceRepository: DeviceRepository,
    appVersionInfoRepository: AppVersionInfoRepository,
    wireguardConstraintsRepository: WireguardConstraintsRepository,
    settingsRepository: SettingsRepository,
    isPlayBuild: Boolean,
) : ViewModel() {

    val uiState: StateFlow<Lc<Unit, SettingsUiState>> =
        combine(
                deviceRepository.deviceState,
                appVersionInfoRepository.versionInfo,
                wireguardConstraintsRepository.wireguardConstraints,
                settingsRepository.settingsUpdates,
            ) { deviceState, versionInfo, wireguardConstraints, settings ->
                SettingsUiState(
                        isLoggedIn = deviceState is DeviceState.LoggedIn,
                        appVersion = versionInfo.currentVersion,
                        isSupportedVersion = versionInfo.isSupported,
                        multihopEnabled = wireguardConstraints?.isMultihopEnabled == true,
                        isDaitaEnabled = settings?.tunnelOptions?.daitaSettings?.enabled == true,
                        isPlayBuild = isPlayBuild,
                    )
                    .toLc<Unit, SettingsUiState>()
            }
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(VIEW_MODEL_STOP_TIMEOUT),
                Lc.Loading(Unit),
            )
}
