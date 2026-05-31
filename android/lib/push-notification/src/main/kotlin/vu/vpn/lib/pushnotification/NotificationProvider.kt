package vu.vpn.lib.pushnotification

import kotlinx.coroutines.flow.Flow
import vu.vpn.lib.model.NotificationUpdate

interface NotificationProvider<D> {
    val notifications: Flow<NotificationUpdate<D>>
}
