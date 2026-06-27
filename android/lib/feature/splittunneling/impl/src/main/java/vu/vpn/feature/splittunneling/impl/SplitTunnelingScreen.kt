package vu.vpn.feature.splittunneling.impl

import androidx.compose.ui.res.stringResource
import vu.vpn.lib.ui.resource.R

import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyItemScope
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.retain.retain
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.focus.FocusManager
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewParameter
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import vu.vpn.common.compose.unlessIsDetail
import vu.vpn.core.Navigator
import vu.vpn.feature.splittunneling.api.SearchSplitTunnelingNavKey
import vu.vpn.feature.splittunneling.impl.applist.AppData
import vu.vpn.feature.splittunneling.impl.extensions.hasValidSize
import vu.vpn.feature.splittunneling.impl.extensions.isBelowMaxByteSize
import vu.vpn.lib.common.Lc
import vu.vpn.lib.model.FeatureIndicator
import vu.vpn.lib.model.PackageName
import vu.vpn.lib.ui.component.ScaffoldWithSmallTopBar
import vu.vpn.lib.ui.component.button.NavigateBackIconButton
import vu.vpn.lib.ui.component.button.NavigateCloseIconButton
import vu.vpn.lib.ui.component.button.SearchButton
import vu.vpn.lib.ui.component.drawVerticalScrollbar
import vu.vpn.lib.ui.component.listitem.IconState
import vu.vpn.lib.ui.component.listitem.SplitTunnelingListItem
import vu.vpn.lib.ui.component.listitem.SwitchListItem
import vu.vpn.lib.ui.component.text.ScreenDescription
import vu.vpn.lib.ui.designsystem.ListHeader
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorLarge
import vu.vpn.lib.ui.designsystem.Position
import vu.vpn.lib.ui.designsystem.PrimaryButton
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.theme.color.AlphaDisabled
import vu.vpn.lib.ui.theme.color.AlphaScrollbar
import vu.vpn.lib.ui.theme.color.AlphaVisible
import vu.vpn.lib.ui.util.visible
import org.koin.androidx.compose.koinViewModel
import org.koin.core.parameter.parametersOf

@Preview("ShowAppList|Loading")
@Composable
private fun PreviewSplitTunnelingScreen(
    @PreviewParameter(SplitTunnelingUiStatePreviewParameterProvider::class)
    state: Lc<Loading, SplitTunnelingUiState>
) {
    AppTheme {
        SplitTunnelingScreen(
            state = state,
            onEnableSplitTunneling = {},
            onShowSystemAppsClick = {},
            onExcludeAppClick = {},
            onIncludeAppClick = {},
            onGrantConsent = {},
            onBackClick = {},
            navigateToSearch = {},
            onResolveIcon = { null },
        )
    }
}

@Composable
fun SharedTransitionScope.SplitTunneling(
    isModal: Boolean,
    navigator: Navigator,
    animatedVisibilityScope: AnimatedVisibilityScope,
) {
    val viewModel = koinViewModel<SplitTunnelingViewModel> { parametersOf(isModal) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val packageManager = remember(context) { context.packageManager }

    SplitTunnelingScreen(
        state = state,
        modifier =
            Modifier.sharedBounds(
                rememberSharedContentState(key = FeatureIndicator.SPLIT_TUNNELING),
                animatedVisibilityScope = animatedVisibilityScope,
            ),
        onEnableSplitTunneling = viewModel::onEnableSplitTunneling,
        onShowSystemAppsClick = viewModel::onShowSystemAppsClick,
        onExcludeAppClick = viewModel::onExcludeAppClick,
        onIncludeAppClick = viewModel::onIncludeAppClick,
        onGrantConsent = viewModel::onGrantAppListConsent,
        onBackClick = dropUnlessResumed { navigator.goBack() },
        navigateToSearch = dropUnlessResumed { navigator.navigate(SearchSplitTunnelingNavKey) },
        onResolveIcon = { packageName -> packageManager.getApplicationIconOrNull(packageName) },
    )
}

@Composable
fun SplitTunnelingScreen(
    state: Lc<Loading, SplitTunnelingUiState>,
    onEnableSplitTunneling: (Boolean) -> Unit,
    onShowSystemAppsClick: (show: Boolean) -> Unit,
    onExcludeAppClick: (packageName: PackageName) -> Unit,
    onIncludeAppClick: (packageName: PackageName) -> Unit,
    onGrantConsent: () -> Unit,
    onBackClick: () -> Unit,
    onResolveIcon: (PackageName) -> Drawable?,
    navigateToSearch: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val focusManager = LocalFocusManager.current

    ScaffoldWithSmallTopBar(
        modifier = modifier.fillMaxSize(),
        appBarTitle = stringResource(id = R.string.psyco_split_tunneling),
        navigationIcon = {
            if (state.isModal()) {
                NavigateCloseIconButton(onNavigateClose = onBackClick)
            } else {
                unlessIsDetail { NavigateBackIconButton(onNavigateBack = onBackClick) }
            }
        },
        actions = { SearchButton(onClick = navigateToSearch, enabled = state.enabled()) },
    ) { modifier ->
        val lazyListState = rememberLazyListState()
        // PSYCO · resolve em escopo @Composable (LazyListScope.appList não é @Composable).
        val excludedHeader = stringResource(id = R.string.psyco_excluded_from_vpn)
        val otherAppsHeader = stringResource(id = R.string.psyco_other_apps)
        LazyColumn(
            modifier =
                modifier
                    .drawVerticalScrollbar(
                        state = lazyListState,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = AlphaScrollbar),
                    )
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(horizontal = Dimens.sideMarginNew),
            horizontalAlignment = Alignment.CenterHorizontally,
            state = lazyListState,
        ) {
            when (state) {
                is Lc.Loading -> {
                    description()
                    spacer()
                    loading()
                }
                is Lc.Content -> {
                    // Prominent disclosure: until the user opts in we show ONLY
                    // the notice — no app list is ever read before consent.
                    if (!state.value.consentGranted) {
                        consentNotice(onGrantConsent = onGrantConsent)
                    } else {
                        description()
                        enabledToggle(
                            enabled = state.value.enabled,
                            onEnableSplitTunneling = onEnableSplitTunneling,
                        )
                        item { HorizontalDivider(color = Color.Transparent) }
                        systemAppsToggle(
                            showSystemApps = state.value.showSystemApps,
                            onShowSystemAppsClick = onShowSystemAppsClick,
                            enabled = state.value.enabled,
                        )
                        appList(
                            state = state.value,
                            focusManager = focusManager,
                            onExcludeAppClick = onExcludeAppClick,
                            onIncludeAppClick = onIncludeAppClick,
                            onResolveIcon = onResolveIcon,
                            excludedHeader = excludedHeader,
                            otherAppsHeader = otherAppsHeader,
                        )
                    }
                }
            }
        }
    }
}

private fun LazyListScope.enabledToggle(
    enabled: Boolean,
    onEnableSplitTunneling: (Boolean) -> Unit,
) {
    item {
        SwitchListItem(
            title = stringResource(id = R.string.psyco_enable),
            isToggled = enabled,
            onCellClicked = onEnableSplitTunneling,
            position = Position.Top,
        )
    }
}

private fun LazyListScope.description() {
    item(key = CommonContentKey.DESCRIPTION, contentType = ContentType.DESCRIPTION) {
        ScreenDescription(
            text =
                stringResource(id = R.string.psyco_split_excluded_desc),
            modifier = Modifier.padding(bottom = Dimens.mediumPadding),
        )
    }
}

private fun LazyListScope.loading() {
    item(key = CommonContentKey.PROGRESS, contentType = ContentType.PROGRESS) {
        MullvadCircularProgressIndicatorLarge()
    }
}

// Prominent-disclosure notice required by Google Play before reading the list of
// installed apps. Shown in-app, in the normal flow, with an affirmative opt-in
// (tapping the button) — closing/going back does NOT grant consent.
private fun LazyListScope.consentNotice(onGrantConsent: () -> Unit) {
    item(key = CommonContentKey.CONSENT, contentType = ContentType.DESCRIPTION) {
        Column(modifier = Modifier.fillMaxWidth().padding(vertical = Dimens.mediumPadding)) {
            Text(
                text = stringResource(id = R.string.psyco_split_consent_title),
                color = MaterialTheme.colorScheme.onSurface,
                style = MaterialTheme.typography.titleMedium,
            )
            Spacer(modifier = Modifier.height(Dimens.smallPadding))
            Text(
                text = stringResource(id = R.string.psyco_split_consent_body),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                style = MaterialTheme.typography.bodyMedium,
            )
            Spacer(modifier = Modifier.height(Dimens.mediumPadding))
            PrimaryButton(
                text = stringResource(id = R.string.psyco_split_consent_grant),
                onClick = onGrantConsent,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

private fun LazyListScope.appList(
    state: SplitTunnelingUiState,
    focusManager: FocusManager,
    onExcludeAppClick: (packageName: PackageName) -> Unit,
    onIncludeAppClick: (packageName: PackageName) -> Unit,
    onResolveIcon: (PackageName) -> Drawable?,
    excludedHeader: String,
    otherAppsHeader: String,
) {
    if (state.excludedApps.isNotEmpty()) {
        excludedAppsHeaderItem(
            key = SplitTunnelingContentKey.EXCLUDED_APPLICATIONS,
            text = excludedHeader,
            enabled = state.enabled,
            exludedAppsCount = state.excludedApps.size,
            includedAppsCount = state.includedApps.size,
        )
        appItems(
            apps = state.excludedApps,
            focusManager = focusManager,
            onAppClick = onIncludeAppClick,
            onResolveIcon = onResolveIcon,
            enabled = state.enabled,
            excluded = true,
        )
    }
    spacer()
    headerItem(
        key = SplitTunnelingContentKey.INCLUDED_APPLICATIONS,
        text = otherAppsHeader,
        enabled = state.enabled,
    )
    appItems(
        apps = state.includedApps,
        focusManager = focusManager,
        onAppClick = onExcludeAppClick,
        onResolveIcon = onResolveIcon,
        enabled = state.enabled,
        excluded = false,
    )
    spacer()
}

internal fun LazyListScope.appItems(
    apps: List<AppData>,
    focusManager: FocusManager,
    onAppClick: (PackageName) -> Unit,
    onResolveIcon: (PackageName) -> Drawable?,
    enabled: Boolean,
    excluded: Boolean,
) {
    itemsIndexedWithDivider(
        items = apps,
        key = { _, listItem -> listItem.packageName.value },
        contentType = { _, _ -> ContentType.ITEM },
    ) { index, listItem ->
        val packageName = listItem.packageName
        var icon by retain(packageName) { mutableStateOf<IconState>(IconState.Loading) }
        LaunchedEffect(packageName) {
            launch(Dispatchers.IO) {
                val drawable = onResolveIcon(packageName)
                icon =
                    if (
                        drawable != null && drawable.isBelowMaxByteSize() && drawable.hasValidSize()
                    ) {
                        IconState.Icon(drawable = drawable)
                    } else {
                        IconState.NoIcon
                    }
            }
        }
        SplitTunnelingListItem(
            title = listItem.name,
            iconState = icon,
            isSelected = excluded,
            isEnabled = enabled,
            modifier = Modifier.animateItem(),
            position =
                when (index) {
                    0 if apps.size == 1 -> Position.Single
                    0 -> Position.Top
                    apps.lastIndex -> Position.Bottom
                    else -> Position.Middle
                },
            backgroundAlpha =
                if (enabled) {
                    AlphaVisible
                } else {
                    AlphaDisabled
                },
        ) {
            // Move focus down unless the clicked item was the last in this
            // section.
            if (index < apps.size - 1) {
                focusManager.moveFocus(FocusDirection.Down)
            } else {
                focusManager.moveFocus(FocusDirection.Up)
            }

            onAppClick(listItem.packageName)
        }
    }
}

internal fun LazyListScope.headerItem(key: String, text: String, enabled: Boolean) {
    itemWithDivider(key = key, contentType = ContentType.HEADER) {
        ListHeader(modifier = Modifier.animateItem().visible(enabled), text = text)
    }
}

internal fun LazyListScope.excludedAppsHeaderItem(
    key: String,
    text: String,
    enabled: Boolean,
    exludedAppsCount: Int,
    includedAppsCount: Int,
) {
    itemWithDivider(key = key, contentType = ContentType.HEADER) {
        ListHeader(
            modifier = Modifier.animateItem().visible(enabled),
            text = text,
            trailingText = "$exludedAppsCount de ${exludedAppsCount + includedAppsCount}",
        )
    }
}

internal fun LazyListScope.systemAppsToggle(
    showSystemApps: Boolean,
    onShowSystemAppsClick: (show: Boolean) -> Unit,
    enabled: Boolean,
) {
    itemWithDivider(
        key = SplitTunnelingContentKey.SHOW_SYSTEM_APPLICATIONS,
        contentType = ContentType.OTHER_ITEM,
    ) {
        SwitchListItem(
            title = stringResource(id = R.string.psyco_show_system_apps),
            isToggled = showSystemApps,
            onCellClicked = { newValue -> onShowSystemAppsClick(newValue) },
            isEnabled = enabled,
            modifier = Modifier.animateItem(),
            backgroundAlpha =
                if (enabled) {
                    AlphaVisible
                } else {
                    AlphaDisabled
                },
            position = Position.Bottom,
        )
    }
}

private fun LazyListScope.spacer() {
    item(contentType = ContentType.SPACER) {
        Spacer(modifier = Modifier.animateItem().height(Dimens.cellVerticalSpacing))
    }
}

private fun Lc<Loading, SplitTunnelingUiState>.isModal(): Boolean =
    when (this) {
        is Lc.Loading -> value.isModal
        is Lc.Content -> value.isModal
    }

private fun Lc<Loading, SplitTunnelingUiState>.enabled(): Boolean =
    when (this) {
        is Lc.Loading -> false
        is Lc.Content -> value.enabled
    }

fun PackageManager.getApplicationIconOrNull(packageName: PackageName): Drawable? =
    try {
        getApplicationIcon(packageName.value)
    } catch (e: PackageManager.NameNotFoundException) {
        // Name not found is thrown if the application is not installed
        null
    } catch (e: IllegalArgumentException) {
        // IllegalArgumentException is thrown if the application has an invalid icon
        null
    } catch (e: OutOfMemoryError) {
        // OutOfMemoryError is thrown if the icon is too large
        null
    }

object CommonContentKey {
    const val DESCRIPTION = "description"
    const val PROGRESS = "progress"
    const val CONSENT = "consent"
}

private inline fun <T> LazyListScope.itemsIndexedWithDivider(
    items: List<T>,
    noinline key: ((index: Int, item: T) -> Any)? = null,
    crossinline contentType: (index: Int, item: T) -> Any? = { _, _ -> null },
    crossinline itemContent: @Composable LazyItemScope.(index: Int, item: T) -> Unit,
) =
    itemsIndexed(items = items, key = key, contentType = contentType) { index, item ->
        itemContent(index, item)
        HorizontalDivider(color = Color.Transparent)
    }

private inline fun LazyListScope.itemWithDivider(
    key: Any? = null,
    contentType: Any? = null,
    crossinline itemContent: @Composable LazyItemScope.() -> Unit,
) =
    item(key = key, contentType = contentType) {
        itemContent()
        HorizontalDivider(color = Color.Transparent)
    }

internal object SplitTunnelingContentKey {
    const val EXCLUDED_APPLICATIONS = "excluded"
    const val SHOW_SYSTEM_APPLICATIONS = "show_system"
    const val INCLUDED_APPLICATIONS = "included"
}
