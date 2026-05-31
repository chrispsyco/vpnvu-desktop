package vu.vpn.feature.problemreport.impl.navigation

import androidx.navigation3.runtime.EntryProviderScope
import androidx.navigation3.scene.DialogSceneStrategy
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.feature.problemreport.api.ProblemReportNoEmailNavKey
import vu.vpn.feature.problemreport.impl.noemail.ReportProblemNoEmail

internal fun EntryProviderScope<NavKey2>.problemReportNoEmailEntry(navigator: Navigator) {
    entry<ProblemReportNoEmailNavKey>(metadata = DialogSceneStrategy.dialog()) {
        ReportProblemNoEmail(navigator = navigator)
    }
}
