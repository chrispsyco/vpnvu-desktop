package vu.vpn.feature.daita.impl

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.WhileSubscribed
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.constant.VIEW_MODEL_STOP_TIMEOUT
import vu.vpn.lib.common.toLc
import vu.vpn.lib.common.util.isDaitaDirectOnly
import vu.vpn.lib.common.util.isDaitaEnabled
import vu.vpn.lib.repository.SettingsRepository

class DaitaViewModel(
    private val isModal: Boolean,
    private val settingsRepository: SettingsRepository,
) : ViewModel() {

    val uiState =
        settingsRepository.settingsUpdates
            .filterNotNull()
            .map { settings ->
                DaitaUiState(
                        daitaEnabled = settings.isDaitaEnabled(),
                        directOnly = settings.isDaitaDirectOnly(),
                        isModal,
                    )
                    .toLc<Boolean, DaitaUiState>()
            }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(VIEW_MODEL_STOP_TIMEOUT),
                initialValue = Lc.Loading(isModal),
            )

    fun setDaita(enable: Boolean) {
        viewModelScope.launch { settingsRepository.setDaitaEnabled(enable) }
    }

    fun setDirectOnly(enable: Boolean) {
        viewModelScope.launch { settingsRepository.setDaitaDirectOnly(enable) }
    }
}
