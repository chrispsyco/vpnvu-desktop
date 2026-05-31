package vu.vpn.lib.usecase.inappnotification

import kotlinx.coroutines.flow.Flow
import vu.vpn.lib.model.InAppNotification

interface InAppNotificationUseCase {
    operator fun invoke(): Flow<InAppNotification?>
}
