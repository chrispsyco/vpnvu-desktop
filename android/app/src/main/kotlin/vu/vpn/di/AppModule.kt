package vu.vpn.di

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationManagerCompat
import androidx.datastore.core.DataStore
import androidx.datastore.dataStore
import java.io.File
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.MainScope
import vu.vpn.BuildConfig
import vu.vpn.feature.appicon.impl.obfuscation.AppObfuscationRepository
import vu.vpn.feature.language.impl.LanguageRepository
import vu.vpn.lib.common.constant.GRPC_SOCKET_FILE_NAME
import vu.vpn.lib.common.constant.GRPC_SOCKET_FILE_NAMED_ARGUMENT
import vu.vpn.lib.endpoint.ApiEndpointFromIntentHolder
import vu.vpn.lib.endpoint.ApiEndpointOverride
import vu.vpn.lib.grpc.ManagementService
import vu.vpn.lib.model.BuildVersion
import vu.vpn.lib.model.NotificationChannel
import vu.vpn.lib.pushnotification.NotificationChannelFactory
import vu.vpn.lib.pushnotification.NotificationManager
import vu.vpn.lib.pushnotification.NotificationProvider
import vu.vpn.lib.pushnotification.ScheduleNotificationAlarmUseCase
import vu.vpn.lib.pushnotification.accountexpiry.AccountExpiryNotificationProvider
import vu.vpn.lib.pushnotification.tunnelstate.TunnelStateNotificationProvider
import vu.vpn.lib.repository.AccountRepository
import vu.vpn.lib.repository.ConnectionProxy
import vu.vpn.lib.repository.DeviceRepository
import vu.vpn.lib.repository.LocaleRepository
import vu.vpn.lib.repository.RelayLocationTranslationRepository
import vu.vpn.lib.repository.UserPreferencesMigration
import vu.vpn.lib.repository.UserPreferencesRepository
import vu.vpn.lib.repository.UserPreferencesSerializer
import vu.vpn.lib.usecase.AccountExpiryNotificationActionUseCase
import vu.vpn.repository.UserPreferences
import org.koin.android.ext.koin.androidContext
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import org.koin.core.qualifier.named
import org.koin.dsl.bind
import org.koin.dsl.module

val appModule = module {
    single(named(GRPC_SOCKET_FILE_NAMED_ARGUMENT)) {
        File(androidContext().noBackupFilesDir, GRPC_SOCKET_FILE_NAME)
    }
    single {
        ManagementService(
            rpcSocketFile = get(named(GRPC_SOCKET_FILE_NAMED_ARGUMENT)),
            extensiveLogging = BuildConfig.DEBUG,
            scope = MainScope(),
        )
    }
    single { ApplicationScope.createDoNotCallUseDiInstead() }

    single { androidContext().resources }
    single { androidContext().userPreferencesStore }
    single { BuildVersion(BuildConfig.VERSION_NAME, BuildConfig.VERSION_CODE) }
    single { ApiEndpointFromIntentHolder() }
    single { AccountRepository(get(), get(), MainScope()) }
    single { DeviceRepository(get()) }
    single { UserPreferencesRepository(get(), get()) }
    single { ConnectionProxy(androidContext(), get(), get()) }
    single { LocaleRepository(get()) }
    single { RelayLocationTranslationRepository(get(), get(), MainScope()) }
    single { ScheduleNotificationAlarmUseCase(androidContext(), get()) }
    single { AccountExpiryNotificationActionUseCase(get(), get()) }
    // TODO Move these back to UiModule when fixDisableBug is removed
    single { AppObfuscationRepository(get(), get()) }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        single { LanguageRepository(androidContext()) }
    }
    single<PackageManager> { androidContext().packageManager }

    single { NotificationChannel.TunnelUpdates } bind NotificationChannel::class
    single { NotificationChannel.AccountUpdates } bind NotificationChannel::class
    single { NotificationChannelFactory(get(), get(), getAll()) } withOptions { createdAtStart() }
    single { NotificationManagerCompat.from(androidContext()) }
    single { NotificationManager(get(), getAll(), get(), MainScope()) } withOptions
        {
            createdAtStart()
        }
    single {
        TunnelStateNotificationProvider(
            androidContext(),
            get(),
            get(),
            get(),
            get<NotificationChannel.TunnelUpdates>().id,
            MainScope(),
        )
    } bind NotificationProvider::class
    single { AccountExpiryNotificationProvider(get<NotificationChannel.AccountUpdates>().id) } bind
        NotificationProvider::class
    if (BuildConfig.FLAVOR_infrastructure != "prod") {
        single<ApiEndpointOverride> {
            ApiEndpointOverride(BuildConfig.API_ENDPOINT, BuildConfig.API_IP)
        }
    }
}

private val Context.userPreferencesStore: DataStore<UserPreferences> by
    dataStore(
        fileName = APP_PREFERENCES_NAME,
        serializer = UserPreferencesSerializer,
        produceMigrations = { UserPreferencesMigration.migrations(it, APP_PREFERENCES_NAME) },
    )

class ApplicationScope private constructor(private val cs: CoroutineScope) : CoroutineScope by cs {
    companion object {
        fun createDoNotCallUseDiInstead(): ApplicationScope = ApplicationScope(MainScope())
    }
}
