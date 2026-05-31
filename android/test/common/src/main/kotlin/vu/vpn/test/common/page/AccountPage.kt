package vu.vpn.test.common.page

import androidx.test.uiautomator.By
import vu.vpn.lib.ui.tag.MANAGE_DEVICES_BUTTON_TEST_TAG
import vu.vpn.test.common.extension.findObjectWithTimeout

class AccountPage internal constructor() : Page() {
    private val logOutSelector = By.text("Log out")

    override fun assertIsDisplayed() {
        uiDevice.findObjectWithTimeout(By.text("Account"))
    }

    fun clickManageDevices() {
        uiDevice.findObject(By.res(MANAGE_DEVICES_BUTTON_TEST_TAG)).click()
    }

    fun clickLogOut() {
        uiDevice.findObjectWithTimeout(logOutSelector).click()
    }
}
