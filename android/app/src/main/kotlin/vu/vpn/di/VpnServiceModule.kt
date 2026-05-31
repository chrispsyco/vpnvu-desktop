package vu.vpn.di

import vu.vpn.app.service.DaemonConfig
import vu.vpn.app.service.migration.MigrateSplitTunneling
import vu.vpn.lib.common.constant.CACHE_DIR_NAMED_ARGUMENT
import vu.vpn.lib.common.constant.FILES_DIR_NAMED_ARGUMENT
import vu.vpn.lib.common.constant.GRPC_SOCKET_FILE_NAMED_ARGUMENT
import org.koin.android.ext.koin.androidContext
import org.koin.core.qualifier.named
import org.koin.dsl.module

val vpnServiceModule = module {
    single(named(FILES_DIR_NAMED_ARGUMENT)) { androidContext().filesDir }
    single(named(CACHE_DIR_NAMED_ARGUMENT)) { androidContext().cacheDir }

    single { MigrateSplitTunneling(androidContext()) }

    single {
        DaemonConfig(
            rpcSocket = get(named(GRPC_SOCKET_FILE_NAMED_ARGUMENT)),
            filesDir = get(named(FILES_DIR_NAMED_ARGUMENT)),
            cacheDir = get(named(CACHE_DIR_NAMED_ARGUMENT)),
            apiEndpointOverride = getOrNull(),
        )
    }
}
