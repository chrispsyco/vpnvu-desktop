package vu.vpn.common.compose

import vu.vpn.lib.model.LatLong
import vu.vpn.lib.model.Latitude
import vu.vpn.lib.model.Longitude

const val MINIMUM_LOADING_TIME_MILLIS = 500L

const val SECURE_ZOOM = 1.15f
const val UNSECURE_ZOOM = 1.20f
const val SECURE_ZOOM_ANIMATION_MILLIS = 2000

const val SETTINGS_HIGHLIGHT_REPEAT_COUNT = 3

// Location of Gothenburg, Sweden
val fallbackLatLong = LatLong(Latitude(57.7065f), Longitude(11.967f))
