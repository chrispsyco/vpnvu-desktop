package vu.vpn.test.common.page

import androidx.test.uiautomator.By
import vu.vpn.test.common.constant.VERY_LONG_TIMEOUT
import vu.vpn.test.common.extension.findObjectWithTimeout

class MullvadWebsite internal constructor() : Page() {
    override fun assertIsDisplayed() {
        uiDevice.findObjectWithTimeout(
            selector = By.text("Mullvad help center"),
            timeout = VERY_LONG_TIMEOUT,
        )
    }
}
