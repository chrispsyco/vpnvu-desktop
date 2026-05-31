package vu.vpn.feature.account.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.accountTransition
import vu.vpn.feature.account.api.AccountNavKey
import vu.vpn.feature.account.impl.Account

fun EntryProviderScope<NavKey2>.accountEntry(navigator: Navigator) {
    entry<AccountNavKey>(metadata = accountTransition()) { Account(navigator = navigator) }
}
