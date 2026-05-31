package vu.vpn.feature.problemreport.impl.viewlogs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import vu.vpn.lib.common.Lc
import vu.vpn.lib.repository.ProblemReportRepository
import vu.vpn.lib.ui.component.NEWLINE_STRING

data class ViewLogsUiState(val allLines: List<String> = emptyList()) {
    fun text() = allLines.joinToString(NEWLINE_STRING)
}

class ViewLogsViewModel(private val problemReportRepository: ProblemReportRepository) :
    ViewModel() {

    private val _uiState = MutableStateFlow<Lc<Unit, ViewLogsUiState>>(Lc.Loading(Unit))
    val uiState = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            _uiState.update {
                Lc.Content(ViewLogsUiState(allLines = problemReportRepository.readLogs()))
            }
        }
    }
}
