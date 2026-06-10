package vu.vpn.lib.ui.component

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FabPosition
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.TileMode
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.unit.dp
import vu.vpn.lib.ui.designsystem.MullvadSnackbar

/**
 * PSYCO · faixa fina (3dp) no bottom do header com gradiente animado fluindo
 * DENTRO da cor do status (escuro↔claro rolando) · indicador de conexão "vivo"
 * sem mudar a cor do header. A cor é passada pelo chamador conforme o estado
 * (vermelho desconectado / laranja conectando / verde conectado).
 */
@Composable
fun StatusStrip(color: Color, modifier: Modifier = Modifier) {
    val transition = rememberInfiniteTransition(label = "statusStrip")
    val shift by
        transition.animateFloat(
            initialValue = 0f,
            targetValue = 1f,
            animationSpec =
                infiniteRepeatable(tween(2200, easing = LinearEasing), RepeatMode.Restart),
            label = "flow",
        )
    // PSYCO · tons um pouco mais escuros · "light" puxa menos pro branco.
    val dark = lerp(color, Color.Black, 0.62f)
    val light = lerp(color, Color.White, 0.25f)
    // período fixo em px + TileMode.Mirror → repete e espelha por toda a largura;
    // animar o offset desloca o padrão = sensação de fluxo contínuo.
    val period = 900f
    val brush =
        Brush.linearGradient(
            colors = listOf(dark, color, light, color, dark),
            start = Offset(shift * period - period, 0f),
            end = Offset(shift * period, 0f),
            tileMode = TileMode.Mirror,
        )
    androidx.compose.foundation.layout.Box(
        modifier.fillMaxWidth().height(4.dp).background(brush)
    )
}

@Composable
fun ScaffoldWithTopBar(
    topBarColor: Color,
    modifier: Modifier = Modifier,
    iconTintColor: Color = MaterialTheme.colorScheme.onPrimary,
    onSettingsClicked: (() -> Unit)?,
    onAccountClicked: (() -> Unit)?,
    isIconAndLogoVisible: Boolean = true,
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
    enabled: Boolean = true,
    content: @Composable (PaddingValues) -> Unit,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            MullvadTopBar(
                containerColor = topBarColor,
                iconTintColor = iconTintColor,
                onSettingsClicked = onSettingsClicked,
                onAccountClicked = onAccountClicked,
                isIconAndLogoVisible = isIconAndLogoVisible,
                enabled = enabled,
            )
        },
        snackbarHost = {
            SnackbarHost(
                snackbarHostState,
                snackbar = { snackbarData -> MullvadSnackbar(snackbarData = snackbarData) },
            )
        },
        content = content,
    )
}

@Composable
fun ScaffoldWithTopBarAndDeviceName(
    topBarColor: Color,
    modifier: Modifier = Modifier,
    iconTintColor: Color = MaterialTheme.colorScheme.onPrimary,
    onSettingsClicked: (() -> Unit)?,
    onAccountClicked: (() -> Unit)?,
    isIconAndLogoVisible: Boolean = true,
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
    deviceName: String?,
    timeLeft: Long?,
    // PSYCO · cor do status pra faixa animada no bottom do header. null = sem faixa.
    statusColor: Color? = null,
    content: @Composable (PaddingValues) -> Unit,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            Column {
                MullvadTopBarWithDeviceName(
                    containerColor = topBarColor,
                    iconTintColor = iconTintColor,
                    onSettingsClicked = onSettingsClicked,
                    onAccountClicked = onAccountClicked,
                    isIconAndLogoVisible = isIconAndLogoVisible,
                    deviceName = deviceName,
                    daysLeftUntilExpiry = timeLeft,
                )
                if (statusColor != null) StatusStrip(statusColor)
            }
        },
        snackbarHost = {
            SnackbarHost(
                snackbarHostState,
                snackbar = { snackbarData -> MullvadSnackbar(snackbarData = snackbarData) },
            )
        },
        content = content,
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScaffoldWithSmallTopBar(
    appBarTitle: String,
    modifier: Modifier = Modifier,
    navigationIcon: @Composable () -> Unit = {},
    actions: @Composable RowScope.() -> Unit = {},
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
    bottomBar: @Composable () -> Unit = {},
    floatingActionButton: @Composable () -> Unit = {},
    floatingActionButtonPosition: FabPosition = FabPosition.End,
    content: @Composable (modifier: Modifier) -> Unit,
) {
    Scaffold(
        modifier = modifier.fillMaxSize().imePadding(),
        topBar = {
            MullvadSmallTopBar(
                title = appBarTitle,
                navigationIcon = navigationIcon,
                actions = actions,
            )
        },
        snackbarHost = {
            SnackbarHost(
                snackbarHostState,
                snackbar = { snackbarData -> MullvadSnackbar(snackbarData = snackbarData) },
            )
        },
        bottomBar = bottomBar,
        floatingActionButton = floatingActionButton,
        floatingActionButtonPosition = floatingActionButtonPosition,
        content = { content(Modifier.fillMaxSize().padding(it)) },
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScaffoldWithSmallTopBar(
    appBarTitle: String,
    modifier: Modifier = Modifier,
    navigationIcon: @Composable () -> Unit = {},
    actions: @Composable RowScope.() -> Unit = {},
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
    content: @Composable (modifier: Modifier) -> Unit,
) {
    Scaffold(
        modifier = modifier.fillMaxSize().imePadding(),
        topBar = {
            MullvadSmallTopBar(
                title = appBarTitle,
                navigationIcon = navigationIcon,
                actions = actions,
            )
        },
        snackbarHost = {
            SnackbarHost(
                snackbarHostState,
                snackbar = { snackbarData -> MullvadSnackbar(snackbarData = snackbarData) },
            )
        },
        content = { content(Modifier.fillMaxSize().padding(it)) },
    )
}
