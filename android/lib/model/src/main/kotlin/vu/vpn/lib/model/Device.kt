package vu.vpn.lib.model

import android.os.Parcelable
import java.time.ZonedDateTime
import kotlinx.parcelize.Parcelize
import vu.vpn.lib.model.extensions.startCase

@Parcelize
data class Device(val id: DeviceId, private val name: String, val creationDate: ZonedDateTime) :
    Parcelable {
    fun displayName(): String = name.startCase()
}
