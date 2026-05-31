package vu.vpn.feature.apiaccess.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.apiaccess.api.EditApiAccessMethodNavKey
import vu.vpn.feature.apiaccess.impl.screen.edit.EditApiAccessMethod

internal fun EntryProviderScope<NavKey2>.editApiAccessMethodEntry(navigator: Navigator) {
    entry<EditApiAccessMethodNavKey>(metadata = slideInHorizontalTransition()) { navKey ->
        EditApiAccessMethod(apiAccessMethodId = navKey.accessMethodId, navigator = navigator)
    }
}
