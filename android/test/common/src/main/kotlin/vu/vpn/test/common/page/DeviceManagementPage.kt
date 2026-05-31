package vu.vpn.test.common.page

import androidx.test.uiautomator.By
import vu.vpn.test.common.extension.expectObjectToDisappearWithTimeout
import vu.vpn.test.common.extension.findObjectWithTimeout

class DeviceManagementPage internal constructor() : Page() {
    override fun assertIsDisplayed() {
        uiDevice.findObjectWithTimeout(By.text("Manage devices"))
    }

    fun removeDevice(deviceName: String) {
        val secondDevice = uiDevice.findObjectWithTimeout(By.text(deviceName)).parent
        secondDevice.findObject(By.clickable(true)).click()
    }

    fun expectDeviceToBeRemoved(deviceName: String) {
        uiDevice.expectObjectToDisappearWithTimeout(By.text(deviceName))
    }
}
