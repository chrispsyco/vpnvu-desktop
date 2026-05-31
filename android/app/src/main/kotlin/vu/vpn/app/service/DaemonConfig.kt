package vu.vpn.app.service

import java.io.File
import vu.vpn.lib.endpoint.ApiEndpointOverride

data class DaemonConfig(
    val rpcSocket: File,
    val filesDir: File,
    val cacheDir: File,
    val apiEndpointOverride: ApiEndpointOverride?,
)
