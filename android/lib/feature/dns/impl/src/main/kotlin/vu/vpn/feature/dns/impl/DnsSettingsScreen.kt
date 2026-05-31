package vu.vpn.feature.dns.impl

import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyItemScope
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import kotlinx.coroutines.launch
import vu.vpn.common.compose.CollectSideEffectWithLifecycle
import vu.vpn.common.compose.dropUnlessResumed
import vu.vpn.common.compose.itemsIndexedWithDivider
import vu.vpn.common.compose.showSnackbarImmediately
import vu.vpn.core.LocalResultStore
import vu.vpn.core.Navigator
import vu.vpn.feature.dns.api.CustomDnsNavKey
import vu.vpn.feature.dns.api.CustomDnsNavResult
import vu.vpn.feature.dns.api.DnsSettingsNavKey
import vu.vpn.feature.dns.api.MalwareInfoNavKey
import vu.vpn.lib.common.Lc
import vu.vpn.lib.model.DefaultDnsOptions
import vu.vpn.lib.ui.component.SPACE_CHAR
import vu.vpn.lib.ui.component.ScaffoldWithSmallTopBar
import vu.vpn.lib.ui.component.button.NavigateBackIconButton
import vu.vpn.lib.ui.component.button.NavigateCloseIconButton
import vu.vpn.lib.ui.component.drawVerticalScrollbar
import vu.vpn.lib.ui.component.listitem.DnsListItem
import vu.vpn.lib.ui.component.listitem.InfoListItem
import vu.vpn.lib.ui.component.listitem.SwitchListItem
import vu.vpn.lib.ui.component.text.ListItemInfo
import vu.vpn.lib.ui.component.text.ScreenDescription
import vu.vpn.lib.ui.designsystem.Hierarchy
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorLarge
import vu.vpn.lib.ui.designsystem.MullvadListItem
import vu.vpn.lib.ui.designsystem.Position
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.tag.CUSTOM_DNS_ADD_ITEM_TEST_TAG
import vu.vpn.lib.ui.tag.CUSTOM_DNS_ITEM_X_TEST_TAG
import vu.vpn.lib.ui.tag.LAZY_LIST_DNS_SETTINGS_TEST_TAG
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.theme.color.AlphaScrollbar
import vu.vpn.lib.ui.theme.typeface.GeistMonoFontFamily
import vu.vpn.lib.ui.util.applyIfNotNull
import org.koin.androidx.compose.koinViewModel
import org.koin.core.parameter.parametersOf

@Preview
@Composable
private fun PreviewDnsSettingsScreen() {
    AppTheme {
        DnsSettingsScreen(
            modifier = Modifier,
            state = Lc.Loading(Unit),
            snackbarHostState = SnackbarHostState(),
            navigateToDns = { _, _ -> },
            onToggleDnsClick = {},
            onToggleAllContentBlockers = {},
            onToggleBlockAds = {},
            onToggleBlockAdultContent = {},
            onToggleBlockGambling = {},
            onToggleBlockMalware = {},
            onToggleBlockSocialMedia = {},
            onToggleBlockTrackers = {},
            navigateToMalwareInfo = {},
            onBackClick = {},
        )
    }
}

@Composable
fun SharedTransitionScope.DnsSettings(
    navigator: Navigator,
    navArgs: DnsSettingsNavKey,
    animatedVisibilityScope: AnimatedVisibilityScope,
) {
    val resultStore = LocalResultStore.current
    val vm = koinViewModel<DnsSettingsViewModel> { parametersOf(navArgs.isModal) }
    val snackbarHostState = remember { SnackbarHostState() }

    resultStore.consumeResult<CustomDnsNavResult> { result ->
        when (result) {
            is CustomDnsNavResult.Success -> {
                vm.showApplySettingChangesWarningToast()
            }
            CustomDnsNavResult.Error -> {
                vm.showGenericErrorToast()
            }
        }
    }

    CollectSideEffectWithLifecycle(vm.uiSideEffect) {
        when (it) {
            DnsSettingsSideEffect.NavigateToDnsDialog -> navigator.navigate(CustomDnsNavKey())
            DnsSettingsSideEffect.ShowToast.ApplySettingWarning ->
                launch {
                    snackbarHostState.showSnackbarImmediately(
                        message = "As alterações podem levar um tempo para entrar em vigor."
                    )
                }
            DnsSettingsSideEffect.ShowToast.GenericError ->
                launch {
                    snackbarHostState.showSnackbarImmediately(message = "Ocorreu um erro.")
                }
        }
    }

    val state by vm.uiState.collectAsStateWithLifecycle()
    DnsSettingsScreen(
        modifier =
            Modifier.applyIfNotNull(navArgs.selectedFeature) {
                sharedBounds(
                    rememberSharedContentState(key = it),
                    animatedVisibilityScope = animatedVisibilityScope,
                )
            },
        state = state,
        snackbarHostState = snackbarHostState,
        navigateToDns =
            dropUnlessResumed { index: Int?, address: String? ->
                navigator.navigate(CustomDnsNavKey(index, address))
            },
        onToggleDnsClick = vm::onToggleCustomDns,
        onToggleAllContentBlockers = vm::onToggleAllBlockers,
        onToggleBlockAds = vm::onToggleBlockAds,
        onToggleBlockAdultContent = vm::onToggleBlockAdultContent,
        onToggleBlockGambling = vm::onToggleBlockGambling,
        onToggleBlockMalware = vm::onToggleBlockMalware,
        onToggleBlockSocialMedia = vm::onToggleBlockSocialMedia,
        onToggleBlockTrackers = vm::onToggleBlockTrackers,
        navigateToMalwareInfo = dropUnlessResumed { navigator.navigate(MalwareInfoNavKey) },
        onBackClick = dropUnlessResumed { navigator.goBack() },
    )
}

@Suppress("LongParameterList")
@Composable
fun DnsSettingsScreen(
    modifier: Modifier,
    state: Lc<Unit, DnsSettingsUiState>,
    snackbarHostState: SnackbarHostState,
    navigateToDns: (index: Int?, address: String?) -> Unit,
    onToggleDnsClick: (Boolean) -> Unit,
    onToggleAllContentBlockers: (Boolean) -> Unit,
    onToggleBlockAds: (Boolean) -> Unit,
    onToggleBlockAdultContent: (Boolean) -> Unit,
    onToggleBlockGambling: (Boolean) -> Unit,
    onToggleBlockMalware: (Boolean) -> Unit,
    onToggleBlockSocialMedia: (Boolean) -> Unit,
    onToggleBlockTrackers: (Boolean) -> Unit,
    navigateToMalwareInfo: () -> Unit,
    onBackClick: () -> Unit,
) {
    ScaffoldWithSmallTopBar(
        modifier = modifier,
        appBarTitle = "Bloqueador de DNS",
        snackbarHostState = snackbarHostState,
        navigationIcon = {
            if (state.contentOrNull()?.isModal == true) {
                NavigateCloseIconButton(onNavigateClose = onBackClick)
            } else {
                NavigateBackIconButton(onNavigateBack = onBackClick)
            }
        },
    ) { modifier ->
        val lazyListState = rememberLazyListState()
        LazyColumn(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier =
                modifier
                    .drawVerticalScrollbar(
                        state = lazyListState,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = AlphaScrollbar),
                    )
                    .testTag(LAZY_LIST_DNS_SETTINGS_TEST_TAG)
                    .padding(horizontal = Dimens.sideMarginNew)
                    .animateContentSize(),
            state = lazyListState,
        ) {
            when (state) {
                is Lc.Loading -> loading()
                is Lc.Content ->
                    content(
                        state = state.value,
                        navigateToDns = navigateToDns,
                        onToggleDnsClick = onToggleDnsClick,
                        onToggleAllBlockers = onToggleAllContentBlockers,
                        onToggleBlockAds = onToggleBlockAds,
                        onToggleBlockAdultContent = onToggleBlockAdultContent,
                        onToggleBlockGambling = onToggleBlockGambling,
                        onToggleBlockMalware = onToggleBlockMalware,
                        onToggleBlockSocialMedia = onToggleBlockSocialMedia,
                        onToggleBlockTrackers = onToggleBlockTrackers,
                        navigateToMalwareInfo = navigateToMalwareInfo,
                    )
            }
        }
    }
}

@Suppress("LongMethod")
private fun LazyListScope.content(
    state: DnsSettingsUiState,
    navigateToDns: (index: Int?, address: String?) -> Unit,
    onToggleDnsClick: (Boolean) -> Unit,
    onToggleAllBlockers: (Boolean) -> Unit,
    onToggleBlockAds: (Boolean) -> Unit,
    onToggleBlockAdultContent: (Boolean) -> Unit,
    onToggleBlockGambling: (Boolean) -> Unit,
    onToggleBlockMalware: (Boolean) -> Unit,
    onToggleBlockSocialMedia: (Boolean) -> Unit,
    onToggleBlockTrackers: (Boolean) -> Unit,
    navigateToMalwareInfo: () -> Unit,
) {
    item {
        // Scale image to fit width up to certain width
        Image(
            contentScale = ContentScale.FillWidth,
            modifier =
                Modifier.animateItem()
                    .widthIn(max = Dimens.settingsDetailsImageMaxWidth)
                    .fillMaxWidth(),
            painter = painterResource(id = R.drawable.dns_content_blockers_illustration),
            contentDescription = "Bloqueadores de conteúdo DNS",
        )
    }

    item { Description() }

    item {
        ContentBlockersHeader(
            numberOfBlockersEnabled = state.defaultDnsOptions.numberOfBlockersEnabled()
        )
    }

    contentBlockers(
        contentBlockersEnabled = state.contentBlockersEnabled,
        defaultDnsOptions = state.defaultDnsOptions,
        onToggleAllBlockers = onToggleAllBlockers,
        onToggleBlockAds = onToggleBlockAds,
        onToggleBlockTrackers = onToggleBlockTrackers,
        onToggleBlockMalware = onToggleBlockMalware,
        onToggleBlockAdultContent = onToggleBlockAdultContent,
        onToggleBlockGambling = onToggleBlockGambling,
        onToggleBlockSocialMedia = onToggleBlockSocialMedia,
        navigateToMalwareInfo = navigateToMalwareInfo,
    )

    if (!state.contentBlockersEnabled) {
        item {
            ListItemInfo(
                text =
                    "Desative \"Usar servidor DNS personalizado\" abaixo para ativar estas " +
                        "configurações.",
                modifier = Modifier.animateItem(),
            )
        }
    } else {
        item { Spacer(modifier = Modifier.height(Dimens.mediumPadding).animateItem()) }
    }

    item { SectionKicker(label = "DNS personalizado") }

    item {
        SwitchListItem(
            modifier = Modifier.animateItem(),
            position = if (state.customDnsEnabled) Position.Top else Position.Single,
            title = "Usar servidor DNS personalizado",
            isToggled = state.customDnsEnabled,
            isEnabled = !state.defaultDnsOptions.isAnyBlockerEnabled,
            onCellClicked = { newValue -> onToggleDnsClick(newValue) },
        )
    }

    if (state.customDnsEnabled) {
        itemsIndexedWithDivider(
            items = state.customDnsEntries,
            key = { _, item -> item.address },
        ) { index, item ->
            DnsListItem(
                modifier = Modifier.animateItem().testTag(CUSTOM_DNS_ITEM_X_TEST_TAG.format(index)),
                hierarchy = Hierarchy.Child1,
                position = Position.Middle,
                address = item.address,
                isUnreachableLocalDnsWarningVisible =
                    item.isLocal && state.showUnreachableLocalDnsWarning,
                isUnreachableIpv6DnsWarningVisible =
                    item.isIpv6 && state.showUnreachableIpv6DnsWarning,
                onClick = { navigateToDns(index, item.address) },
            )
        }

        if (state.customDnsEntries.isNotEmpty()) {
            item {
                MullvadListItem(
                    modifier = Modifier.animateItem().testTag(CUSTOM_DNS_ADD_ITEM_TEST_TAG),
                    hierarchy = Hierarchy.Child1,
                    position = Position.Bottom,
                    onClick = { navigateToDns(null, null) },
                    content = { Text(text = "Adicionar um servidor") },
                    trailingContent = {
                        Icon(imageVector = Icons.Rounded.Add, contentDescription = null)
                    },
                )
            }
        }
    }

    if (state.defaultDnsOptions.isAnyBlockerEnabled) {
        item {
            ListItemInfo(
                modifier = Modifier.animateItem(),
                text =
                    "Desative todos os \"Bloqueadores de conteúdo DNS\" acima para ativar esta " +
                        "configuração.",
            )
        }
    }

    item { Spacer(modifier = Modifier.height(Dimens.cellVerticalSpacing)) }
}

@Composable
private fun LazyItemScope.Description() {
    ScreenDescription(
        modifier = Modifier.animateItem().padding(top = Dimens.smallPadding),
        text =
            "Quando ativados, o servidor DNS da vpn.vu bloqueia domínios dessas categorias " +
                "antes de responder à consulta. Não inspeciona o tráfego.",
    )
}

@Composable
private fun LazyItemScope.ContentBlockersHeader(numberOfBlockersEnabled: Int) {
    InfoListItem(
        modifier = Modifier.animateItem(),
        position = Position.Top,
        content = {
            Row {
                Text(
                    modifier = Modifier.weight(1f),
                    text = "Bloqueadores de conteúdo DNS",
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                if (numberOfBlockersEnabled > 0) {
                    Text(SPACE_CHAR.toString())
                    Text(
                        "($numberOfBlockersEnabled)",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        },
    )
}

private fun LazyListScope.contentBlockers(
    contentBlockersEnabled: Boolean,
    defaultDnsOptions: DefaultDnsOptions,
    onToggleAllBlockers: (Boolean) -> Unit,
    onToggleBlockAds: (Boolean) -> Unit,
    onToggleBlockTrackers: (Boolean) -> Unit,
    onToggleBlockMalware: (Boolean) -> Unit,
    onToggleBlockAdultContent: (Boolean) -> Unit,
    onToggleBlockGambling: (Boolean) -> Unit,
    onToggleBlockSocialMedia: (Boolean) -> Unit,
    navigateToMalwareInfo: () -> Unit,
) {
    item {
        ContentBlocker(
            title = "Tudo",
            subtitle = "Bloquear todas as categorias",
            isToggled = defaultDnsOptions.isAllBlockersEnabled,
            isEnabled = contentBlockersEnabled,
            onClicked = onToggleAllBlockers,
        )
    }
    item {
        ContentBlocker(
            title = "Anúncios",
            subtitle = "Banners, pop-ups, anúncios nativos",
            isToggled = defaultDnsOptions.blockAds,
            isEnabled = contentBlockersEnabled,
            onClicked = onToggleBlockAds,
        )
    }
    item {
        ContentBlocker(
            title = "Rastreadores",
            subtitle = "Analytics, fingerprinting, telemetria",
            isToggled = defaultDnsOptions.blockTrackers,
            isEnabled = contentBlockersEnabled,
            onClicked = onToggleBlockTrackers,
        )
    }
    item {
        ContentBlocker(
            title = "Malware",
            subtitle = "Domínios maliciosos conhecidos",
            isToggled = defaultDnsOptions.blockMalware,
            isEnabled = contentBlockersEnabled,
            onClicked = onToggleBlockMalware,
            onInfoClicked = navigateToMalwareInfo,
        )
    }
    item {
        ContentBlocker(
            title = "Conteúdo adulto",
            subtitle = "Sites NSFW",
            isToggled = defaultDnsOptions.blockAdultContent,
            isEnabled = contentBlockersEnabled,
            onClicked = onToggleBlockAdultContent,
        )
    }
    item {
        ContentBlocker(
            title = "Apostas",
            subtitle = "Cassinos online, apostas",
            isToggled = defaultDnsOptions.blockGambling,
            isEnabled = contentBlockersEnabled,
            onClicked = onToggleBlockGambling,
        )
    }
    item {
        ContentBlocker(
            title = "Redes sociais",
            subtitle = "Twitter, Facebook, TikTok, Instagram",
            isToggled = defaultDnsOptions.blockSocialMedia,
            isEnabled = contentBlockersEnabled,
            onClicked = onToggleBlockSocialMedia,
            position = Position.Bottom,
        )
    }
}

@Composable
private fun LazyItemScope.ContentBlocker(
    title: String,
    isToggled: Boolean,
    isEnabled: Boolean,
    position: Position = Position.Middle,
    subtitle: String? = null,
    onClicked: (Boolean) -> Unit,
    onInfoClicked: (() -> Unit)? = null,
) {
    SwitchListItem(
        modifier = Modifier.animateItem(),
        position = position,
        hierarchy = Hierarchy.Child1,
        title = title,
        subtitle = subtitle,
        singeLine = false,
        isToggled = isToggled,
        isEnabled = isEnabled,
        onCellClicked = { onClicked(it) },
        onInfoClicked = onInfoClicked,
    )
}

private fun LazyListScope.loading() {
    item { MullvadCircularProgressIndicatorLarge() }
}

// PSYCO · section-label cinza-mono (Geist Mono) batendo 1:1 com o Figma
// (.mv-section-title): uppercase, letter-spacing, cor muted.
@Composable
private fun SectionKicker(label: String) {
    Text(
        text = label.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        fontFamily = GeistMonoFontFamily,
        letterSpacing = 1.6.sp,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier =
            Modifier.fillMaxWidth()
                .padding(
                    top = Dimens.mediumPadding,
                    bottom = Dimens.smallPadding,
                    start = Dimens.smallPadding,
                ),
    )
}
