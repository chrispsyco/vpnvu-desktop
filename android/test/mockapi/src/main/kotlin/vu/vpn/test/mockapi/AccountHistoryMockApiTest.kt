package vu.vpn.test.mockapi

import androidx.test.uiautomator.By
import java.time.ZonedDateTime
import vu.vpn.test.common.extension.findObjectWithTimeout
import vu.vpn.test.common.page.AccountPage
import vu.vpn.test.common.page.ConnectPage
import vu.vpn.test.common.page.LoginPage
import vu.vpn.test.common.page.on
import vu.vpn.test.mockapi.constant.DEFAULT_DEVICE_LIST
import vu.vpn.test.mockapi.constant.DUMMY_DEVICE_NAME_2
import vu.vpn.test.mockapi.constant.DUMMY_ID_2
import org.junit.jupiter.api.Test

class AccountHistoryMockApiTest : MockApiTest() {

    @Test
    fun testShowAccountHistory() {
        // Arrange
        val validAccountNumber = "1234123412341234"
        apiRouter.apply {
            expectedAccountNumber = validAccountNumber
            accountExpiry = ZonedDateTime.now().plusMonths(1)
            devices = DEFAULT_DEVICE_LIST.toMutableMap()
            devicePendingToGetCreated = DUMMY_ID_2 to DUMMY_DEVICE_NAME_2
        }

        app.launchAndLogIn(validAccountNumber)

        on<ConnectPage> { clickAccount() }

        on<AccountPage> { clickLogOut() }

        val expectedResult = "1234 1234 1234 1234"
        on<LoginPage> {
            toggleRevealInput()
            assertHasAccountHistory(expectedResult)
            device.findObjectWithTimeout(By.text(expectedResult)).click()
        }

        on<ConnectPage>()
    }
}
