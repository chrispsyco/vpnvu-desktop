package vu.vpn.feature.problemreport.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.feature.problemreport.api.ViewLogsNavKey
import vu.vpn.feature.problemreport.impl.viewlogs.ViewLogs

internal fun EntryProviderScope<NavKey2>.viewLogsReportEntry(navigator: Navigator) {
    entry<ViewLogsNavKey>(metadata = slideInHorizontalTransition()) {
        ViewLogs(navigator = navigator)
    }
}
