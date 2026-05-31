package vu.vpn.feature.apiaccess.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.apiaccess.api.EncryptedDnsProxyInfoNavKey
import vu.vpn.feature.apiaccess.impl.screen.edpinfo.EncryptedDnsProxyInfo

internal fun EntryProviderScope<NavKey2>.encryptedDnsProxyAccessEntry(navigator: Navigator) {
    entry<EncryptedDnsProxyInfoNavKey>(metadata = DialogSceneStrategy.dialog()) {
        EncryptedDnsProxyInfo(navigator = navigator)
    }
}
