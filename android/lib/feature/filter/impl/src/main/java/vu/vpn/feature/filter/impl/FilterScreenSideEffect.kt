package vu.vpn.feature.filter.impl

sealed interface FilterScreenSideEffect {
    data object CloseScreen : FilterScreenSideEffect
}
