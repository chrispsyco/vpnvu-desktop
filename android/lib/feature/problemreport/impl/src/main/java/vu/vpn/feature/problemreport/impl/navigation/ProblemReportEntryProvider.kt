package vu.vpn.feature.problemreport.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.slideInHorizontalTransition
import vu.vpn.core.scene.ListDetailSceneStrategy
import vu.vpn.feature.problemreport.api.ProblemReportNavKey
import vu.vpn.feature.problemreport.impl.ReportProblem

fun EntryProviderScope<NavKey2>.problemReportEntry(navigator: Navigator) {
    entry<ProblemReportNavKey>(
        metadata = ListDetailSceneStrategy.detailPane() + slideInHorizontalTransition()
    ) {
        ReportProblem(navigator = navigator)
    }

    problemReportNoEmailEntry(navigator)
    viewLogsReportEntry(navigator)
}
