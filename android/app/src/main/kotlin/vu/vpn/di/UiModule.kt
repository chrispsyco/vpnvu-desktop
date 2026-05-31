package vu.vpn.di

import android.content.ComponentName
import android.os.Build
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.MainScope
import vu.vpn.BuildConfig
import vu.vpn.app.MainActivity
import vu.vpn.app.MullvadAppViewModel
import vu.vpn.feature.account.impl.AccountViewModel
import vu.vpn.feature.addtime.impl.AddTimeViewModel
import vu.vpn.feature.anticensorship.impl.AntiCensorshipSettingsViewModel
import vu.vpn.feature.anticensorship.impl.customport.CustomPortDialogViewModel
import vu.vpn.feature.anticensorship.impl.selectport.SelectPortViewModel
import vu.vpn.feature.apiaccess.impl.screen.delete.DeleteApiAccessMethodConfirmationViewModel
import vu.vpn.feature.apiaccess.impl.screen.detail.ApiAccessMethodDetailsViewModel
import vu.vpn.feature.apiaccess.impl.screen.edit.EditApiAccessMethodViewModel
import vu.vpn.feature.apiaccess.impl.screen.list.ApiAccessListViewModel
import vu.vpn.feature.apiaccess.impl.screen.save.SaveApiAccessMethodViewModel
import vu.vpn.feature.appicon.impl.AppIconViewModel
import vu.vpn.feature.appinfo.impl.AppInfoViewModel
import vu.vpn.feature.appinfo.impl.changelog.ChangelogViewModel
import vu.vpn.feature.applisting.api.ResolveAppListingUseCase
import vu.vpn.feature.applisting.impl.AndroidInstallSourceProvider
import vu.vpn.feature.applisting.impl.InstallSourceProvider
import vu.vpn.feature.applisting.impl.ResolveAppListingUseCaseImpl
import vu.vpn.feature.autoconnect.impl.AutoConnectAndLockdownModeViewModel
import vu.vpn.feature.customlist.impl.screen.create.CreateCustomListDialogViewModel
import vu.vpn.feature.customlist.impl.screen.delete.DeleteCustomListConfirmationViewModel
import vu.vpn.feature.customlist.impl.screen.editlist.EditCustomListViewModel
import vu.vpn.feature.customlist.impl.screen.editlocations.CustomListLocationsViewModel
import vu.vpn.feature.customlist.impl.screen.editname.EditCustomListNameDialogViewModel
import vu.vpn.feature.customlist.impl.screen.lists.CustomListsViewModel
import vu.vpn.feature.daita.impl.DaitaViewModel
import vu.vpn.feature.deleteaccount.impl.deleteaccountconfirmation.DeleteAccountConfirmationViewModel
import vu.vpn.feature.dns.impl.CustomDnsDialogViewModel
import vu.vpn.feature.dns.impl.DnsSettingsViewModel
import vu.vpn.feature.filter.impl.FilterViewModel
import vu.vpn.feature.home.impl.connect.ConnectViewModel
import vu.vpn.feature.home.impl.connect.notificationbanner.InAppNotificationController
import vu.vpn.feature.home.impl.devicerevoked.DeviceRevokedViewModel
import vu.vpn.feature.home.impl.outoftime.OutOfTimeViewModel
import vu.vpn.feature.home.impl.welcome.WelcomeViewModel
import vu.vpn.feature.language.impl.LanguageViewModel
import vu.vpn.feature.location.api.LocationBottomSheetState
import vu.vpn.feature.location.impl.RelayListScrollConnection
import vu.vpn.feature.location.impl.SelectLocationViewModel
import vu.vpn.feature.location.impl.bottomsheet.LocationBottomSheetViewModel
import vu.vpn.feature.location.impl.list.SelectLocationListViewModel
import vu.vpn.feature.location.impl.search.SearchLocationViewModel
import vu.vpn.feature.login.impl.LoginViewModel
import vu.vpn.feature.login.impl.apiunreachable.ApiUnreachableViewModel
import vu.vpn.feature.login.impl.devicelist.DeviceListViewModel
import vu.vpn.feature.managedevices.impl.ManageDevicesViewModel
import vu.vpn.feature.multihop.impl.MultihopViewModel
import vu.vpn.feature.notification.impl.NotificationSettingsViewModel
import vu.vpn.feature.problemreport.impl.ReportProblemViewModel
import vu.vpn.feature.problemreport.impl.viewlogs.ViewLogsViewModel
import vu.vpn.feature.redeemvoucher.impl.VoucherDialogViewModel
import vu.vpn.feature.serveripoverride.impl.ServerIpOverridesViewModel
import vu.vpn.feature.serveripoverride.impl.reset.ResetServerIpOverridesConfirmationViewModel
import vu.vpn.feature.settings.impl.SettingsViewModel
import vu.vpn.feature.splittunneling.impl.SplitTunnelingViewModel
import vu.vpn.feature.splittunneling.impl.applist.ApplicationsProvider
import vu.vpn.feature.splittunneling.impl.applist.SplitTunnelingUseCase
import vu.vpn.feature.splittunneling.impl.search.SearchSplitTunnelingViewModel
import vu.vpn.feature.vpnsettings.impl.VpnSettingsViewModel
import vu.vpn.feature.vpnsettings.impl.mtu.MtuDialogViewModel
import vu.vpn.lib.common.constant.BillingTypes
import vu.vpn.lib.model.PackageName
import vu.vpn.lib.model.RelayListType
import vu.vpn.lib.payment.PaymentProvider
import vu.vpn.lib.repository.ApiAccessRepository
import vu.vpn.lib.repository.AppVersionInfoRepository
import vu.vpn.lib.repository.AutoStartAndConnectOnBootRepository
import vu.vpn.lib.repository.ChangelogDataProvider
import vu.vpn.lib.repository.ChangelogRepository
import vu.vpn.lib.repository.CustomListsRepository
import vu.vpn.lib.repository.EmptyPaymentUseCase
import vu.vpn.lib.repository.NewDeviceRepository
import vu.vpn.lib.repository.PaymentLogic
import vu.vpn.lib.repository.PlayPaymentLogic
import vu.vpn.lib.repository.ProblemReportRepository
import vu.vpn.lib.repository.RelayListFilterRepository
import vu.vpn.lib.repository.RelayLatencyRepository
import vu.vpn.lib.repository.RelayListRepository
import vu.vpn.lib.repository.RelayOverridesRepository
import vu.vpn.lib.repository.SettingsRepository
import vu.vpn.lib.repository.SplashCompleteRepository
import vu.vpn.lib.repository.SplitTunnelingRepository
import vu.vpn.lib.repository.VoucherRepository
import vu.vpn.lib.repository.WireguardConstraintsRepository
import vu.vpn.lib.usecase.DeleteCustomDnsUseCase
import vu.vpn.lib.usecase.FilterChipUseCase
import vu.vpn.lib.usecase.FilteredRelayListUseCase
import vu.vpn.lib.usecase.HopSelectionUseCase
import vu.vpn.lib.usecase.InternetAvailableUseCase
import vu.vpn.lib.usecase.LastKnownLocationUseCase
import vu.vpn.lib.usecase.ModifyAndEnableMultihopUseCase
import vu.vpn.lib.usecase.ModifyMultihopUseCase
import vu.vpn.lib.usecase.OutOfTimeUseCase
import vu.vpn.lib.usecase.ProviderToOwnershipsUseCase
import vu.vpn.lib.usecase.RecentsUseCase
import vu.vpn.lib.usecase.RelayItemCanBeSelectedUseCase
import vu.vpn.lib.usecase.SelectAndEnableMultihopUseCase
import vu.vpn.lib.usecase.SelectSinglehopUseCase
import vu.vpn.lib.usecase.SelectedLocationTitleUseCase
import vu.vpn.lib.usecase.SelectedLocationUseCase
import vu.vpn.lib.usecase.SupportEmailUseCase
import vu.vpn.lib.usecase.SystemVpnSettingsAvailableUseCase
import vu.vpn.lib.usecase.customlists.CustomListActionUseCase
import vu.vpn.lib.usecase.customlists.CustomListRelayItemsUseCase
import vu.vpn.lib.usecase.customlists.CustomListsRelayItemUseCase
import vu.vpn.lib.usecase.customlists.FilterCustomListsRelayItemUseCase
import vu.vpn.lib.usecase.inappnotification.AccountExpiryInAppNotificationUseCase
import vu.vpn.lib.usecase.inappnotification.Android16UpdateWarningUseCase
import vu.vpn.lib.usecase.inappnotification.InAppNotificationUseCase
import vu.vpn.lib.usecase.inappnotification.NewChangelogNotificationUseCase
import vu.vpn.lib.usecase.inappnotification.NewDeviceNotificationUseCase
import vu.vpn.lib.usecase.inappnotification.TunnelStateNotificationUseCase
import vu.vpn.lib.usecase.inappnotification.VersionNotificationUseCase
import vu.vpn.receiver.AutoStartVpnBootCompletedReceiver
import vu.vpn.screen.privacy.PrivacyDisclaimerViewModel
import vu.vpn.screen.splash.SplashViewModel
import vu.vpn.serviceconnection.ServiceConnectionManager
import org.apache.commons.validator.routines.InetAddressValidator
import org.koin.android.ext.koin.androidContext
import org.koin.core.module.dsl.viewModel
import org.koin.core.qualifier.named
import org.koin.dsl.bind
import org.koin.dsl.module

val uiModule = module {
    single<ComponentName>(named(BOOT_COMPLETED_RECEIVER_COMPONENT_NAME)) {
        ComponentName(androidContext(), AutoStartVpnBootCompletedReceiver::class.java)
    }

    single<PackageName> { PackageName(androidContext().packageName) }
    single<InstallSourceProvider> { AndroidInstallSourceProvider(androidContext()) }
    single<ResolveAppListingUseCase> {
        ResolveAppListingUseCaseImpl(
            resources = androidContext().resources,
            packageName = get(),
            isPlayBuild = IS_PLAY_BUILD,
            installSourceProvider = get(),
        )
    }
    single { ApplicationsProvider(get(), get()) }
    scope<MainActivity> { scoped { ServiceConnectionManager(androidContext()) } }
    single { InetAddressValidator.getInstance() }
    single { androidContext().assets }
    single { androidContext().contentResolver }

    single { ChangelogRepository(get(), get(), get()) }
    single { SettingsRepository(get()) }
    single {
        ProblemReportRepository(
            context = androidContext(),
            apiEndpointOverride = getOrNull(),
            apiEndpointFromIntentHolder = get(),
            kermitFileLogDirName = KERMIT_FILE_LOG_DIR_NAME,
            accountRepository = get(),
            paymentLogic = get(),
        )
    }
    single { RelayOverridesRepository(get()) }
    single { CustomListsRepository(get()) }
    single { RelayListRepository(get(), get()) }
    single { RelayLatencyRepository(get(), get()) }
    single { RelayListFilterRepository(get()) }
    single { VoucherRepository(get(), get()) }
    single { SplitTunnelingRepository(get()) }
    single { SplitTunnelingUseCase(get(), get(), get(), Dispatchers.IO) }
    single { ApiAccessRepository(get()) }
    single { NewDeviceRepository() }
    single { SplashCompleteRepository() }
    single {
        AutoStartAndConnectOnBootRepository(
            get(),
            get(named(BOOT_COMPLETED_RECEIVER_COMPONENT_NAME)),
        )
    }
    single { WireguardConstraintsRepository(get()) }

    single { AccountExpiryInAppNotificationUseCase(get()) } bind InAppNotificationUseCase::class
    single { TunnelStateNotificationUseCase(get(), get(), get()) } bind
        InAppNotificationUseCase::class
    single {
        VersionNotificationUseCase(get(), BuildConfig.ENABLE_IN_APP_VERSION_NOTIFICATIONS)
    } bind InAppNotificationUseCase::class
    single { NewDeviceNotificationUseCase(get(), get()) } bind InAppNotificationUseCase::class
    single { NewChangelogNotificationUseCase(get()) } bind InAppNotificationUseCase::class
    if (Build.VERSION.SDK_INT == Build.VERSION_CODES.BAKLAVA) {
        single { Android16UpdateWarningUseCase(get(), get()) } bind InAppNotificationUseCase::class
    }

    single { OutOfTimeUseCase(get(), get(), MainScope()) }
    single { InternetAvailableUseCase(get()) }
    single { SystemVpnSettingsAvailableUseCase(androidContext()) }
    single { CustomListActionUseCase(get(), get()) }
    single { SelectedLocationTitleUseCase(get(), get()) }
    single { ProviderToOwnershipsUseCase(get()) }
    single { FilterCustomListsRelayItemUseCase(get(), get()) }
    single { CustomListsRelayItemUseCase(get(), get()) }
    single { CustomListRelayItemsUseCase(get(), get()) }
    single { FilteredRelayListUseCase(get(), get(), get()) }
    single { LastKnownLocationUseCase(get()) }
    single { SelectedLocationUseCase(get(), get()) }
    single { FilterChipUseCase(get(), get(), get()) }
    single { DeleteCustomDnsUseCase(get()) }
    single { RecentsUseCase(get(), get(), get()) }
    single { SelectSinglehopUseCase(relayListRepository = get()) }
    single {
        ModifyMultihopUseCase(
            relayListRepository = get(),
            settingsRepository = get(),
            customListsRepository = get(),
            wireguardConstraintsRepository = get(),
        )
    }
    single {
        SupportEmailUseCase(
            context = androidContext(),
            problemReportRepository = get(),
            buildVersion = get(),
        )
    }
    single {
        HopSelectionUseCase(
            customListRelayItemUseCase = get(),
            relayListRepository = get(),
            settingsRepository = get(),
        )
    }
    single {
        SelectAndEnableMultihopUseCase(relayListRepository = get(), settingsRepository = get())
    }
    single {
        RelayItemCanBeSelectedUseCase(
            filteredRelayListUseCase = get(),
            hopSelectionUseCase = get(),
            settingsRepository = get(),
            relayListRepository = get(),
        )
    }
    single {
        ModifyAndEnableMultihopUseCase(
            relayListRepository = get(),
            settingsRepository = get(),
            customListsRepository = get(),
            wireguardConstraintsRepository = get(),
        )
    }

    single { InAppNotificationController(getAll(), MainScope()) }

    single { ChangelogDataProvider(get()) }

    // Will be resolved using from either of the two PaymentModule.kt classes.
    single { PaymentProvider(get()) }

    single<PaymentLogic> {
        val paymentRepository = get<PaymentProvider>().paymentRepository
        if (paymentRepository != null) {
            PlayPaymentLogic(paymentRepository = paymentRepository)
        } else {
            EmptyPaymentUseCase()
        }
    }

    single { AppVersionInfoRepository(get(), get()) }

    single { RelayListScrollConnection() }

    // View models
    viewModel { AccountViewModel(get(), get(), get()) }
    viewModel { DeleteAccountConfirmationViewModel(get(), get()) }
    viewModel { params -> ChangelogViewModel(navArgs = params.get(), get(), get()) }
    viewModel {
        AppInfoViewModel(
            appVersionInfoRepository = get(),
            isPlayBuild = IS_PLAY_BUILD,
            resolveAppListing = get(),
        )
    }
    viewModel {
        ConnectViewModel(
            accountRepository = get(),
            deviceRepository = get(),
            changelogRepository = get(),
            inAppNotificationController = get(),
            newDeviceRepository = get(),
            userPreferencesRepository = get(),
            selectedLocationTitleUseCase = get(),
            outOfTimeUseCase = get(),
            paymentUseCase = get(),
            connectionProxy = get(),
            lastKnownLocationUseCase = get(),
            systemVpnSettingsUseCase = get(),
            isPlayBuild = IS_PLAY_BUILD,
            resolveAppListing = get(),
        )
    }
    viewModel { params -> DeviceListViewModel(accountNumber = params.get(), get()) }
    viewModel { params ->
        ManageDevicesViewModel(accountNumber = params.get(), get(), Dispatchers.IO)
    }
    viewModel { DeviceRevokedViewModel(get(), get(), get(), get()) }
    viewModel { params -> MtuDialogViewModel(navArgs = params.get(), get()) }
    viewModel { params -> CustomDnsDialogViewModel(navArgs = params.get(), get(), get(), get()) }
    viewModel { params -> CustomPortDialogViewModel(navArgs = params.get()) }
    viewModel { LoginViewModel(get(), get(), get(), get(), get()) }
    viewModel { PrivacyDisclaimerViewModel(get(), IS_PLAY_BUILD) }
    viewModel {
        SelectLocationViewModel(
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
        )
    }
    viewModel { SettingsViewModel(get(), get(), get(), get(), IS_PLAY_BUILD) }
    viewModel { SplashViewModel(get(), get(), get(), get()) }
    viewModel { VoucherDialogViewModel(get(), get()) }
    viewModel { params -> VpnSettingsViewModel(navArgs = params.get(), get(), get(), get(), get()) }
    viewModel { params -> AntiCensorshipSettingsViewModel(isModal = params.get(), get()) }
    viewModel { WelcomeViewModel(get(), get(), get(), get(), isPlayBuild = IS_PLAY_BUILD) }
    viewModel {
        ReportProblemViewModel(
            mullvadProblemReporter = get(),
            problemReportRepository = get(),
            accountRepository = get(),
            isPlayBuild = IS_PLAY_BUILD,
        )
    }
    viewModel { ViewLogsViewModel(get()) }
    viewModel { OutOfTimeViewModel(get(), get(), get(), get(), get(), isPlayBuild = IS_PLAY_BUILD) }
    viewModel { FilterViewModel(get(), get()) }
    viewModel { params ->
        CreateCustomListDialogViewModel(locationCode = params.getOrNull(), get())
    }
    viewModel { params ->
        CustomListLocationsViewModel(navArgs = params.get(), get(), get(), get())
    }
    viewModel { params -> EditCustomListViewModel(customListId = params.get(), get()) }
    viewModel { params -> EditCustomListNameDialogViewModel(navArgs = params.get(), get()) }
    viewModel { CustomListsViewModel(get(), get()) }
    viewModel { params -> DeleteCustomListConfirmationViewModel(navArgs = params.get(), get()) }
    viewModel { params -> ServerIpOverridesViewModel(navArgs = params.get(), get(), get()) }
    viewModel { ResetServerIpOverridesConfirmationViewModel(get()) }
    viewModel { ApiAccessListViewModel(get()) }
    viewModel { params ->
        EditApiAccessMethodViewModel(apiAccessMethodId = params.getOrNull(), get(), get())
    }
    viewModel { params -> SaveApiAccessMethodViewModel(navArgs = params.get(), get()) }
    viewModel { params -> ApiAccessMethodDetailsViewModel(apiAccessMethodId = params.get(), get()) }
    viewModel { params ->
        DeleteApiAccessMethodConfirmationViewModel(apiAccessMethodId = params.get(), get())
    }
    viewModel { params -> SelectPortViewModel(navArgs = params.get(), get(), get(), get()) }
    viewModel { params -> MultihopViewModel(isModal = params.get(), get(), get()) }
    viewModel { NotificationSettingsViewModel(get()) }
    viewModel { params ->
        SearchLocationViewModel(
            relayListType = params.get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
        )
    }
    viewModel { (relayListType: RelayListType) ->
        SelectLocationListViewModel(
            relayListType,
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
            get(),
        )
    }
    viewModel { params -> DaitaViewModel(isModal = params.get(), get()) }
    viewModel {
        AddTimeViewModel(
            paymentUseCase = get(),
            accountRepository = get(),
            connectionProxy = get(),
            isPlayBuild = IS_PLAY_BUILD,
        )
    }
    viewModel { params ->
        ApiUnreachableViewModel(
            navArgs = params.get(),
            apiAccessRepository = get(),
            supportEmailUseCase = get(),
        )
    }
    viewModel { (locationBottomSheetState: LocationBottomSheetState) ->
        LocationBottomSheetViewModel(
            locationBottomSheetState = locationBottomSheetState,
            customListActionUseCase = get(),
            canBeSelectedUseCase = get(),
            customListsRelayItemUseCase = get(),
            selectedLocationUseCase = get(),
            modifyMultihopUseCase = get(),
            wireguardConstraintsRepository = get(),
            selectAndEnableMultihopUseCase = get(),
            hopSelectionUseCase = get(),
            modifyAndEnableMultihopUseCase = get(),
            customListsRepository = get(),
        )
    }
    viewModel { AppIconViewModel(get()) }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        viewModel { LanguageViewModel(get()) }
    }
    viewModel { AutoConnectAndLockdownModeViewModel(isPlayBuild = IS_PLAY_BUILD) }
    viewModel { params ->
        SplitTunnelingViewModel(isModal = params.get(), get(), get(), get(), Dispatchers.IO)
    }
    viewModel { SearchSplitTunnelingViewModel(get(), get(), Dispatchers.IO) }
    viewModel { params ->
        DnsSettingsViewModel(
            isModal = params.get(),
            settingsRepository = get(),
            dispatcher = Dispatchers.IO,
        )
    }

    // This view model must be single so we correctly attach lifecycle and share it with activity
    single { MullvadAppViewModel(get(), get()) }
}

const val APP_PREFERENCES_NAME = "${BuildConfig.APPLICATION_ID}.app_preferences"
const val KERMIT_FILE_LOG_DIR_NAME = "android_app_logs"

private const val BOOT_COMPLETED_RECEIVER_COMPONENT_NAME = "BOOT_COMPLETED_RECEIVER_COMPONENT_NAME"
private val IS_PLAY_BUILD = BuildConfig.FLAVOR_billing == BillingTypes.PLAY
