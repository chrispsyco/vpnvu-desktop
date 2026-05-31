package vu.vpn.lib.usecase.inappnotification

import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import vu.vpn.lib.model.InAppNotification
import vu.vpn.lib.model.VersionInfo
import vu.vpn.lib.repository.AppVersionInfoRepository

class VersionNotificationUseCase(
    private val appVersionInfoRepository: AppVersionInfoRepository,
    private val isVersionInfoNotificationEnabled: Boolean,
) : InAppNotificationUseCase {

    override operator fun invoke() =
        appVersionInfoRepository.versionInfo
            .map { versionInfo -> unsupportedVersionNotification(versionInfo) }
            .distinctUntilChanged()

    private fun unsupportedVersionNotification(versionInfo: VersionInfo): InAppNotification? {
        if (!isVersionInfoNotificationEnabled) {
            return null
        }

        return if (!versionInfo.isSupported) {
            InAppNotification.UnsupportedVersion(versionInfo)
        } else null
    }
}
