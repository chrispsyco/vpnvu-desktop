package vu.vpn.feature.filter.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.filter.api.FilterNavKey
import vu.vpn.feature.filter.impl.Filter

fun EntryProviderScope<NavKey2>.filterEntry(navigator: Navigator) {
    entry<FilterNavKey>(metadata = slideInHorizontalTransition()) { Filter(navigator = navigator) }
}
