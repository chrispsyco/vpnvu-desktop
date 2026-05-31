package vu.vpn.test.e2e

import vu.vpn.test.common.page.LoginPage
import vu.vpn.test.common.page.MullvadWebsite
import vu.vpn.test.common.page.SettingsPage
import vu.vpn.test.common.page.on
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test

class WebLinkTest : EndToEndTest() {
    @Test
    @Disabled("Disabled due to broken in-browser text detection (DROID-2009)")
    fun testOpenFaqFromApp() {
        app.launchAndEnsureOnLoginPage()

        on<LoginPage> { clickSettings() }

        on<SettingsPage> { clickFaqAndGuides() }

        on<MullvadWebsite>()
    }
}
