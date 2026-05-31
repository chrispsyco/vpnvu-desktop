package vu.vpn.feature.multihop.impl

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.WhileSubscribed
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.constant.VIEW_MODEL_STOP_TIMEOUT
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.repository.WireguardConstraintsRepository
import vu.vpn.lib.usecase.HopSelectionUseCase

class MultihopViewModel(
    private val isModal: Boolean,
    private val wireguardConstraintsRepository: WireguardConstraintsRepository,
    hopSelectionUseCase: HopSelectionUseCase,
) : ViewModel() {

    val uiState: StateFlow<Lc<Boolean, MultihopUiState>> =
        combine(
                wireguardConstraintsRepository.wireguardConstraints.filterNotNull(),
                hopSelectionUseCase(),
            ) { constraints, hop ->
                Lc.Content(
                    MultihopUiState(
                        enable = constraints.isMultihopEnabled,
                        entry = hop.entry(),
                        exit = hop.exit(),
                        isModal = isModal,
                    )
                )
            }
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(VIEW_MODEL_STOP_TIMEOUT),
                Lc.Loading(isModal),
            )

    fun setMultihop(enable: Boolean) {
        viewModelScope.launch { wireguardConstraintsRepository.setMultihop(enable) }
    }
}

data class MultihopUiState(
    val enable: Boolean,
    val entry: Constraint<RelayItem>? = null,
    val exit: Constraint<RelayItem>? = null,
    val isModal: Boolean = false,
)
