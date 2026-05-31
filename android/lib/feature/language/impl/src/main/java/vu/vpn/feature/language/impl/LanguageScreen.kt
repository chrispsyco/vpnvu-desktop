package vu.vpn.feature.language.impl

import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.dropUnlessResumed
import java.util.Locale
import vu.vpn.common.compose.itemsIndexedWithDivider
import vu.vpn.common.compose.unlessIsDetail
import vu.vpn.core.Navigator
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.toLc
import vu.vpn.lib.ui.component.ScaffoldWithSmallTopBar
import vu.vpn.lib.ui.component.button.NavigateBackIconButton
import vu.vpn.lib.ui.component.listitem.SelectableListItem
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorLarge
import vu.vpn.lib.ui.designsystem.Position
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import org.koin.androidx.compose.koinViewModel

@Preview
@Composable
private fun PreviewLanguageScreen() {
    AppTheme {
        LanguageScreen(
            state =
                LanguageUiState(
                        languages =
                            listOf(
                                LanguageItem.SystemDefault(isSelected = true),
                                LanguageItem.Language(
                                    locale = Locale.ENGLISH,
                                    displayName = "English",
                                    isSelected = false,
                                ),
                                LanguageItem.Language(
                                    locale = Locale.forLanguageTag("sv"),
                                    displayName = "Svenska",
                                    isSelected = false,
                                ),
                            )
                    )
                    .toLc(),
            onLanguageSelected = {},
            onBackClick = {},
        )
    }
}

@Composable
@RequiresApi(android.os.Build.VERSION_CODES.TIRAMISU)
fun Language(navigator: Navigator) {
    val viewModel = koinViewModel<LanguageViewModel>()
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    LanguageScreen(
        state = state,
        onLanguageSelected = viewModel::setLanguage,
        onBackClick = dropUnlessResumed { navigator.goBack() },
    )
}

@Composable
fun LanguageScreen(
    state: Lc<Unit, LanguageUiState>,
    onLanguageSelected: (Locale?) -> Unit,
    onBackClick: () -> Unit,
) {
    ScaffoldWithSmallTopBar(
        appBarTitle = stringResource(id = R.string.language),
        navigationIcon = { unlessIsDetail { NavigateBackIconButton(onNavigateBack = onBackClick) } },
    ) { modifier ->
        val lazyListState: LazyListState = rememberLazyListState()
        LazyColumn(
            state = lazyListState,
            modifier = modifier.padding(horizontal = Dimens.sideMarginNew),
        ) {
            when (state) {
                is Lc.Loading -> item { MullvadCircularProgressIndicatorLarge() }
                is Lc.Content -> {
                    val languages = state.value.languages
                    itemsIndexedWithDivider(items = languages, key = { _, item -> item.key }) {
                        index,
                        item ->
                        SelectableListItem(
                            title =
                                when (item) {
                                    is LanguageItem.Language -> item.displayName
                                    is LanguageItem.SystemDefault ->
                                        stringResource(R.string.system_default)
                                },
                            isSelected = item.isSelected,
                            onClick = { onLanguageSelected(item.locale) },
                            position =
                                when {
                                    languages.size == 1 -> Position.Single
                                    index == 0 -> Position.Top
                                    index == languages.size - 1 -> Position.Bottom
                                    else -> Position.Middle
                                },
                        )
                    }
                    item { Spacer(modifier = Modifier.height(Dimens.cellVerticalSpacing)) }
                }
            }
        }
    }
}
