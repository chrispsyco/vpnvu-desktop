package vu.vpn.feature.language.impl.navigation

import androidx.annotation.RequiresApi
import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.language.api.LanguageNavKey
import vu.vpn.feature.language.impl.Language

@RequiresApi(android.os.Build.VERSION_CODES.TIRAMISU)
fun EntryProviderScope<NavKey2>.languageEntry(navigator: Navigator) {
    entry<LanguageNavKey>(metadata = slideInHorizontalTransition()) {
        Language(navigator = navigator)
    }
}
