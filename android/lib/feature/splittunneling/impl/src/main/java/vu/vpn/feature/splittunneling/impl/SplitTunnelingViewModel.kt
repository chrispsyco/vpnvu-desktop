package vu.vpn.feature.splittunneling.impl

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.WhileSubscribed
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import vu.vpn.feature.splittunneling.impl.applist.SplitTunnelingUseCase
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.constant.VIEW_MODEL_STOP_TIMEOUT
import vu.vpn.lib.model.PackageName
import vu.vpn.lib.repository.SplitTunnelingRepository
import vu.vpn.lib.repository.UserPreferencesRepository

@OptIn(ExperimentalCoroutinesApi::class)
class SplitTunnelingViewModel(
    isModal: Boolean,
    private val splitTunnelingRepository: SplitTunnelingRepository,
    private val userPreferencesRepository: UserPreferencesRepository,
    private val splitTunnelingUseCase: SplitTunnelingUseCase,
    private val dispatcher: CoroutineDispatcher,
) : ViewModel() {

    val uiState: StateFlow<Lc<Loading, SplitTunnelingUiState>> =
        // Gate on the prominent-disclosure consent: while it is false we surface
        // the disclosure notice and never collect splitTunnelingUseCase() — so
        // ApplicationsProvider.apps() (the installed-app enumeration) only runs
        // after the user has affirmatively opted in.
        userPreferencesRepository
            .splitTunnelingAppListConsent()
            .flatMapLatest { consentGranted ->
                if (!consentGranted) {
                    flowOf(
                        Lc.Content(
                            SplitTunnelingUiState(consentGranted = false, isModal = isModal)
                        )
                    )
                } else {
                    appListState(isModal)
                }
            }
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(VIEW_MODEL_STOP_TIMEOUT),
                Lc.Loading(Loading(isModal = isModal)),
            )

    private fun appListState(isModal: Boolean): Flow<Lc<Loading, SplitTunnelingUiState>> =
        combine(
                splitTunnelingUseCase(),
                splitTunnelingRepository.splitTunnelingEnabled,
                userPreferencesRepository.showSystemAppsSplitTunneling(),
            ) { splitApps, enabled, showSystemApps ->
                val content: Lc<Loading, SplitTunnelingUiState> =
                    Lc.Content(
                        SplitTunnelingUiState(
                            enabled = enabled,
                            excludedApps = splitApps.excludedApps,
                            includedApps = splitApps.includedApps,
                            showSystemApps = showSystemApps,
                            isModal = isModal,
                            consentGranted = true,
                        )
                    )
                content
            }
            // Show the spinner again while the freshly-consented app list loads,
            // instead of briefly flashing the disclosure notice.
            .onStart { emit(Lc.Loading(Loading(isModal = isModal))) }

    fun onGrantAppListConsent() {
        viewModelScope.launch(dispatcher) {
            userPreferencesRepository.setSplitTunnelingAppListConsent(true)
        }
    }

    fun onEnableSplitTunneling(isEnabled: Boolean) {
        viewModelScope.launch(dispatcher) {
            splitTunnelingRepository.enableSplitTunneling(isEnabled)
        }
    }

    fun onIncludeAppClick(packageName: PackageName) {
        viewModelScope.launch(dispatcher) { splitTunnelingRepository.includeApp(packageName) }
    }

    fun onExcludeAppClick(packageName: PackageName) {
        viewModelScope.launch(dispatcher) { splitTunnelingRepository.excludeApp(packageName) }
    }

    fun onShowSystemAppsClick(show: Boolean) {
        viewModelScope.launch(dispatcher) {
            userPreferencesRepository.setShowSystemAppsSplitTunneling(show)
        }
    }
}
