package vu.vpn.feature.settings.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.topLevelTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.settings.api.SettingsNavKey
import vu.vpn.feature.settings.impl.Settings

fun EntryProviderScope<NavKey2>.settingsEntry(navigator: Navigator) {
    entry<SettingsNavKey>(metadata = ListDetailSceneStrategy.listPane() + topLevelTransition()) {
        Settings(navigator = navigator)
    }
}
