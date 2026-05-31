@file:Suppress("MatchingDeclarationName")

package vu.vpn.app

import android.Manifest
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.animation.ContentTransform
import androidx.compose.animation.ExperimentalSharedTransitionApi
import androidx.compose.animation.SharedTransitionLayout
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.scene.DialogSceneStrategy
import androidx.navigation3.scene.SinglePaneSceneStrategy
import androidx.navigation3.ui.NavDisplay
import co.touchlab.kermit.Logger
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import kotlinx.coroutines.cancel
import vu.vpn.common.compose.LocalSharedTransitionScope
import vu.vpn.common.compose.accessibilityDataSensitive
import vu.vpn.core.LocalResultStore
import vu.vpn.core.NavKey2
import vu.vpn.core.Navigator
import vu.vpn.core.animation.TRANSITION_DEFAULT_DURATION_MS
import vu.vpn.core.rememberNavigationState
import vu.vpn.core.rememberResultStore
import vu.vpn.core.scene.SingleOverlaySceneStrategy
import vu.vpn.core.scene.rememberListDetailSceneStrategy
import vu.vpn.core.toEntries
import vu.vpn.feature.account.impl.navigation.accountEntry
import vu.vpn.feature.addtime.impl.navigation.addTimeVerificationPendingEntry
import vu.vpn.feature.anticensorship.impl.navigation.anticensorshipEntry
import vu.vpn.feature.apiaccess.impl.navigation.apiAccessEntry
import vu.vpn.feature.appearance.impl.navigation.appearanceEntry
import vu.vpn.feature.appicon.impl.navigation.appIconEntry
import vu.vpn.feature.appinfo.impl.navigation.changelogEntry
import vu.vpn.feature.autoconnect.impl.navigation.autoConnectEntry
import vu.vpn.feature.customlist.impl.navigation.customListEntry
import vu.vpn.feature.daita.impl.navigation.daitaEntry
import vu.vpn.feature.deleteaccount.impl.navigation.deleteAccountEntry
import vu.vpn.feature.dns.impl.navigation.dnsSettingsEntry
import vu.vpn.feature.filter.impl.navigation.filterEntry
import vu.vpn.feature.home.impl.navigation.homeEntry
import vu.vpn.feature.language.impl.navigation.languageEntry
import vu.vpn.feature.location.impl.navigation.selectLocationEntry
import vu.vpn.feature.login.impl.devicelist.navigation.deviceListEntry
import vu.vpn.feature.login.impl.devicelist.navigation.removeDeviceConfirmationDialogEntry
import vu.vpn.feature.login.impl.navigation.loginEntry
import vu.vpn.feature.managedevices.impl.navigation.manageDevicesEntry
import vu.vpn.feature.multihop.impl.navigation.multihopEntry
import vu.vpn.feature.notification.impl.navigation.notificationEntry
import vu.vpn.feature.problemreport.impl.navigation.problemReportEntry
import vu.vpn.feature.redeemvoucher.impl.navigation.redeemVoucherEntry
import vu.vpn.feature.serveripoverride.impl.navigation.serverIpOverrideEntry
import vu.vpn.feature.settings.impl.navigation.settingsEntry
import vu.vpn.feature.splittunneling.impl.navigation.splitTunnelingEntry
import vu.vpn.feature.vpnsettings.impl.navigation.vpnSettingsEntry
import vu.vpn.screen.navigation.NoDaemonNavKey
import vu.vpn.screen.navigation.SplashNavKey
import vu.vpn.screen.navigation.noDaemonEntry
import vu.vpn.screen.navigation.privacyDisclaimerEntry
import vu.vpn.screen.navigation.splashEntry
import vu.vpn.serviceconnection.ServiceConnectionManager
import vu.vpn.serviceconnection.ServiceConnectionState
import org.koin.androidx.compose.koinViewModel

@OptIn(
    ExperimentalComposeUiApi::class,
    ExperimentalSharedTransitionApi::class,
    ExperimentalPermissionsApi::class,
)
@Composable
@Suppress("LongMethod")
fun MullvadApp(serviceConnectionManager: ServiceConnectionManager) {
    val resultStore = rememberResultStore()
    val navigationState = rememberNavigationState(SplashNavKey)

    val listDetailStrategy = rememberListDetailSceneStrategy<NavKey2>()
    val dialogStrategy = remember { DialogSceneStrategy<NavKey2>() }
    val bottomSheetStrategy = remember { SingleOverlaySceneStrategy<NavKey2>() }
    val singlePaneStrategy = remember { SinglePaneSceneStrategy<NavKey2>() }

    val nav3 = remember {
        Navigator(
            state = navigationState,
            resultStore = resultStore,
            screenIsListDetailTargetWidth = listDetailStrategy.isListDetailTargetWidth(),
        )
    }

    val mullvadAppViewModel = koinViewModel<MullvadAppViewModel>()

    val lifecycleOwner = LocalLifecycleOwner.current
    LaunchedEffect(lifecycleOwner) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            navigationState.backStackFlow.collect { backstack ->
                mullvadAppViewModel.setCurrentBackStack(backstack)
            }
        }
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        CheckNotificationPermission(serviceConnectionManager)
    }

    val entryProvider = entryProvider {
        accountEntry(nav3)
        addTimeVerificationPendingEntry(nav3)
        anticensorshipEntry(nav3)
        apiAccessEntry(nav3)
        appIconEntry(nav3)
        appearanceEntry(nav3)
        autoConnectEntry(nav3)
        changelogEntry(nav3)
        customListEntry(nav3)
        daitaEntry(nav3)
        deleteAccountEntry(nav3)
        deviceListEntry(nav3)
        filterEntry(nav3)
        homeEntry(nav3)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            languageEntry(nav3)
        }
        loginEntry(nav3)
        manageDevicesEntry(nav3)
        multihopEntry(nav3)
        noDaemonEntry(nav3)
        notificationEntry(nav3)
        privacyDisclaimerEntry(nav3)
        problemReportEntry(nav3)
        redeemVoucherEntry(nav3)
        removeDeviceConfirmationDialogEntry(nav3)
        selectLocationEntry(nav3)
        serverIpOverrideEntry(nav3)
        settingsEntry(nav3)
        splashEntry(nav3)
        splitTunnelingEntry(nav3)
        vpnSettingsEntry(nav3)
        dnsSettingsEntry(nav3)
    }

    SharedTransitionLayout {
        CompositionLocalProvider(LocalSharedTransitionScope provides this@SharedTransitionLayout) {
            CompositionLocalProvider(LocalResultStore provides resultStore) {
                NavDisplay(
                    modifier =
                        Modifier.semantics { testTagsAsResourceId = true }
                            .fillMaxSize()
                            .accessibilityDataSensitive(),
                    sceneStrategies =
                        listOf(
                            listDetailStrategy,
                            dialogStrategy,
                            bottomSheetStrategy,
                            singlePaneStrategy,
                        ),
                    entries = navigationState.toEntries(entryProvider),
                    onBack = { nav3.goBack() },
                    sharedTransitionScope = this@SharedTransitionLayout,
                    transitionSpec = { defaultNavDisplayTransitionSpec() },
                    popTransitionSpec = { defaultNavDisplayTransitionSpec() },
                    predictivePopTransitionSpec = { defaultNavDisplayTransitionSpec() },
                )
            }
        }
    }

    // For the following LaunchedEffect we do not use CollectSideEffectWithLifecycle since we
    // collect from StateFlow/SharedFlow with replay and don't want to trigger a navigation again.

    // Globally handle daemon dropped connection with NoDaemonScreen
    LaunchedEffect(Unit) {
        mullvadAppViewModel.uiSideEffect.collect {
            Logger.i { "DaemonScreenEvent: $it" }
            when (it) {
                DaemonScreenEvent.Show -> nav3.navigate(NoDaemonNavKey)

                DaemonScreenEvent.Remove -> nav3.goBackUntil(NoDaemonNavKey, inclusive = true)
            }
        }
    }
}

private fun defaultNavDisplayTransitionSpec(): ContentTransform =
    fadeIn(tween(TRANSITION_DEFAULT_DURATION_MS)) togetherWith
        fadeOut(tween(TRANSITION_DEFAULT_DURATION_MS))

@OptIn(ExperimentalPermissionsApi::class)
@Composable
@RequiresApi(Build.VERSION_CODES.TIRAMISU)
private fun CheckNotificationPermission(serviceConnectionManager: ServiceConnectionManager) {
    val notificationPermission =
        rememberPermissionState(permission = Manifest.permission.POST_NOTIFICATIONS)
    LaunchedEffect(Unit) {
        serviceConnectionManager.connectionState.collect {
            if (it is ServiceConnectionState.Bound) {
                if (!notificationPermission.status.isGranted) {
                    notificationPermission.launchPermissionRequest()
                    cancel(
                        message =
                            "We should only show one notification permission dialog per app start"
                    )
                }
            }
        }
    }
}
