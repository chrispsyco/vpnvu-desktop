package vu.vpn.test.common.page

import androidx.test.uiautomator.By
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.waitForStableInActiveWindow
import vu.vpn.lib.ui.tag.ADD_TIME_BOTTOM_SHEET_TITLE_TEST_TAG
import vu.vpn.test.common.constant.LONG_TIMEOUT
import vu.vpn.test.common.extension.findObjectWithTimeout

class AddTimeBottomSheet internal constructor() : Page() {
    private val oneMonthSelector = By.textStartsWith("Add 30 days time")

    override fun assertIsDisplayed() {
        uiDevice.findObjectWithTimeout(By.res(ADD_TIME_BOTTOM_SHEET_TITLE_TEST_TAG))
    }

    fun click30days() {
        uiDevice.findObjectWithTimeout(oneMonthSelector).click()
    }
}

fun UiDevice.buyGooglePlayTime() {
    findObjectWithTimeout(By.text("1-tap buy"), LONG_TIMEOUT)
    findObjectWithTimeout(By.text("1-tap buy")).click()
    waitForStableInActiveWindow()
    findObjectWithTimeout(By.text("Close"), LONG_TIMEOUT).click()
}
