package vu.vpn.lib.map.data

import androidx.compose.runtime.Immutable
import vu.vpn.lib.model.LatLong

@Immutable
data class Marker(
    val latLong: LatLong,
    val size: Float = DEFAULT_MARKER_SIZE,
    val colors: LocationMarkerColors,
) {
    companion object {
        private const val DEFAULT_MARKER_SIZE = 0.02f
    }
}
