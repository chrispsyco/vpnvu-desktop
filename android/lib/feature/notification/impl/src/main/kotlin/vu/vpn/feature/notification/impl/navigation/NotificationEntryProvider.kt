package vu.vpn.feature.notification.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.notification.api.NotificationSettingsNavKey
import vu.vpn.feature.notification.impl.NotificationSettings

fun EntryProviderScope<NavKey2>.notificationEntry(navigator: Navigator) {
    entry<NotificationSettingsNavKey>(
        metadata = ListDetailSceneStrategy.detailPane() + slideInHorizontalTransition()
    ) {
        NotificationSettings(navigator = navigator)
    }
}
