package vu.vpn.test.e2e

import vu.vpn.test.common.page.AccountPage
import vu.vpn.test.common.page.ConnectPage
import vu.vpn.test.common.page.LoginPage
import vu.vpn.test.common.page.on
import vu.vpn.test.e2e.misc.AccountTestRule
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.RegisterExtension

class LogoutTest : EndToEndTest() {

    @RegisterExtension @JvmField val accountTestRule = AccountTestRule()

    @Test
    fun testLogout() {
        // Given
        app.launchAndLogIn(accountTestRule.validAccountNumber)

        on<ConnectPage> { clickAccount() }

        on<AccountPage> { clickLogOut() }

        on<LoginPage>()
    }
}
