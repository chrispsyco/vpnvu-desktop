package vu.vpn.test.e2e

import androidx.test.uiautomator.By
import vu.vpn.lib.ui.tag.CONNECT_CARD_HEADER_TEST_TAG
import vu.vpn.test.common.annotation.SkipForFlavors
import vu.vpn.test.common.constant.VERY_LONG_TIMEOUT
import vu.vpn.test.common.extension.findObjectWithTimeout
import vu.vpn.test.common.page.AddTimeBottomSheet
import vu.vpn.test.common.page.LoginPage
import vu.vpn.test.common.page.OutOfTimePage
import vu.vpn.test.common.page.buyGooglePlayTime
import vu.vpn.test.common.page.on
import vu.vpn.test.e2e.annotations.RequiresGoogleBillingAccount
import vu.vpn.test.e2e.annotations.RequiresPartnerAuth
import vu.vpn.test.e2e.misc.AccountTestRule
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.RegisterExtension

class PaymentTest : EndToEndTest() {

    @RegisterExtension @JvmField val accountTestRule = AccountTestRule(withTime = false)

    @Test
    @SkipForFlavors(currentFlavor = BuildConfig.FLAVOR_billing, "oss")
    @RequiresGoogleBillingAccount
    @RequiresPartnerAuth
    fun testInAppPurchaseForOutOfTime() {
        val validTestAccountNumber = accountTestRule.validAccountNumber

        app.launchAndEnsureOnLoginPage()

        on<LoginPage> {
            enterAccountNumber(validTestAccountNumber)
            clickLoginButton()
        }

        on<OutOfTimePage> { clickAddTime() }

        on<AddTimeBottomSheet> { click30days() }

        device.buyGooglePlayTime()

        // Assert we reach the Connect page after purchase
        device.findObjectWithTimeout(
            By.res(CONNECT_CARD_HEADER_TEST_TAG),
            timeout = VERY_LONG_TIMEOUT,
        )
    }
}
