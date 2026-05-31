package vu.vpn.lib.usecase.inappnotification

import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import vu.vpn.lib.model.InAppNotification
import vu.vpn.lib.repository.ChangelogRepository

class NewChangelogNotificationUseCase(private val changelogRepository: ChangelogRepository) :
    InAppNotificationUseCase {
    override operator fun invoke() =
        changelogRepository.hasUnreadChangelog
            .map { if (it) InAppNotification.NewVersionChangelog else null }
            .distinctUntilChanged()
}
