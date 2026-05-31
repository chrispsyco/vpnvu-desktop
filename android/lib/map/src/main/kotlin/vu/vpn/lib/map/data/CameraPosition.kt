package vu.vpn.lib.map.data

import androidx.compose.runtime.Immutable
import vu.vpn.lib.model.LatLong

@Immutable data class CameraPosition(val latLong: LatLong, val zoom: Float, val verticalBias: Float)
