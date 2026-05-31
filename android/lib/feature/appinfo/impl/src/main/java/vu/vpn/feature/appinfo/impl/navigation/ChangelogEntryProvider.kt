package vu.vpn.feature.appinfo.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.appinfo.api.ChangelogNavKey
import vu.vpn.feature.appinfo.impl.changelog.Changelog

fun EntryProviderScope<NavKey2>.changelogEntry(navigator: Navigator) {
    entry<ChangelogNavKey>(metadata = slideInHorizontalTransition()) { navKey ->
        Changelog(navArgs = navKey, navigator = navigator)
    }

    appInfoEntry(navigator)
}
