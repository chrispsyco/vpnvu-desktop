package vu.vpn.feature.vpnsettings.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.lib.model.FeatureIndicator

@Parcelize
data class VpnSettingsNavKey(
    val scrollToFeature: FeatureIndicator? = null,
    val isModal: Boolean = false,
) : NavKey2
