package vu.vpn.feature.anticensorship.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.lib.model.FeatureIndicator

@Parcelize
data class AntiCensorshipNavKey(
    val selectedFeature: FeatureIndicator? = null,
    val isModal: Boolean = false,
) : NavKey2
