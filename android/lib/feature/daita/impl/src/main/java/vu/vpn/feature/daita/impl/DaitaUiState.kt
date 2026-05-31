package vu.vpn.feature.daita.impl

data class DaitaUiState(
    val daitaEnabled: Boolean,
    val directOnly: Boolean,
    val isModal: Boolean = false,
)
