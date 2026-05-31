package vu.vpn.lib.usecase.inappnotification

import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import vu.vpn.lib.model.InAppNotification
import vu.vpn.lib.repository.DeviceRepository
import vu.vpn.lib.repository.NewDeviceRepository

class NewDeviceNotificationUseCase(
    private val newDeviceRepository: NewDeviceRepository,
    private val deviceRepository: DeviceRepository,
) : InAppNotificationUseCase {
    override operator fun invoke() =
        combine(
                deviceRepository.deviceState.map { it?.displayName() },
                newDeviceRepository.isNewDevice,
            ) { deviceName, newDeviceCreated ->
                if (newDeviceCreated && deviceName != null) {
                    InAppNotification.NewDevice(deviceName)
                } else null
            }
            .distinctUntilChanged()
}
