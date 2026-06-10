package vu.vpn.feature.appearance.impl

import android.os.Build
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.compose.dropUnlessResumed
import vu.vpn.common.compose.itemWithDivider
import vu.vpn.common.compose.unlessIsDetail
import vu.vpn.core.Navigator
import vu.vpn.feature.language.api.LanguageNavKey
import vu.vpn.lib.ui.component.ScaffoldWithSmallTopBar
import vu.vpn.lib.ui.component.button.NavigateBackIconButton
import vu.vpn.lib.ui.component.listitem.NavigationListItem
import vu.vpn.lib.ui.designsystem.Position
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens

@OptIn(ExperimentalMaterial3Api::class)
@Preview
@Composable
private fun PreviewAppearanceScreen() {
    AppTheme { AppearanceScreen(onLanguageClick = {}, onBackClick = {}) }
}

@Composable
fun Appearance(navigator: Navigator) {
    AppearanceScreen(
        onLanguageClick =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                dropUnlessResumed { navigator.navigate(LanguageNavKey) }
            } else {
                null
            },
        onBackClick = dropUnlessResumed { navigator.goBack() },
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppearanceScreen(
    onLanguageClick: (() -> Unit)?,
    onBackClick: () -> Unit,
) {
    ScaffoldWithSmallTopBar(
        appBarTitle = stringResource(id = R.string.appearance),
        navigationIcon = { unlessIsDetail { NavigateBackIconButton(onNavigateBack = onBackClick) } },
    ) { modifier ->
        val lazyListState: LazyListState = rememberLazyListState()
        LazyColumn(
            modifier = modifier.padding(horizontal = Dimens.sideMarginNew),
            state = lazyListState,
        ) {
            // PSYCO · "App icon" (disguise/obfuscation, herança do Mullvad) removido do VPN.vu:
            // a feature de trocar o ícone do app pra disfarçar não faz sentido no produto.
            // Os activity-alias continuam no manifest (todos enabled=false exceto Default),
            // mas sem ponto de entrada na UI o usuário nunca os ativa. Sobra só Idioma.
            if (onLanguageClick != null) {
                item {
                    NavigationListItem(
                        title = stringResource(id = R.string.language),
                        onClick = onLanguageClick,
                        position = Position.Single,
                    )
                }
            }
        }
    }
}
