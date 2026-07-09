package vu.vpn.screen.splash

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin
import vu.vpn.R
import vu.vpn.common.compose.CollectSideEffectWithLifecycle
import vu.vpn.BuildConfig
import vu.vpn.core.Navigator
import vu.vpn.feature.home.api.ConnectNavKey
import vu.vpn.feature.home.api.DeviceRevokedNavKey
import vu.vpn.feature.home.api.OutOfTimeNavKey
import vu.vpn.feature.login.api.LoginNavKey
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.screen.navigation.PrivacyDisclaimerNavKey
import org.koin.androidx.compose.koinViewModel

@Preview
@Composable
private fun PreviewLoadingScreen() {
    AppTheme { SplashScreen() }
}

@Composable
fun Splash(navigator: Navigator) {
    val viewModel: SplashViewModel = koinViewModel()

    CollectSideEffectWithLifecycle(viewModel.uiSideEffect) {
        when (it) {
            SplashUiSideEffect.NavigateToConnect ->
                navigator.navigate(ConnectNavKey, clearBackStack = true)
            SplashUiSideEffect.NavigateToLogin ->
                navigator.navigate(LoginNavKey(), clearBackStack = true)
            SplashUiSideEffect.NavigateToPrivacyDisclaimer ->
                navigator.navigate(PrivacyDisclaimerNavKey, clearBackStack = true)
            SplashUiSideEffect.NavigateToRevoked ->
                navigator.navigate(DeviceRevokedNavKey, clearBackStack = true)
            SplashUiSideEffect.NavigateToOutOfTime ->
                navigator.navigate(OutOfTimeNavKey, clearBackStack = true)
        }
    }

    SplashScreen()
}

/**
 * PSYCO · porta do LaunchView desktop. Background deep navy com globo cyan
 * translúcido girando atrás · véu radial escuro no centro pra dim o globo
 * onde fica o logo · logo branco em pulse ring · brand "VPN.vu" + tagline
 * "Your VPN · no name, no traces" + spinner ring com mensagens rotativas
 * a cada ~1.25s (Initializing security → Connecting to service → Loading
 * relays → Almost ready). Footer "VPN.vu · vX · Android".
 */
@Composable
fun SplashScreen() {
    // PSYCO · localização inicial nula · o WebViewGlobe entra em idle drift,
    // depois de ~1.2s recebe a localização do usuário (SP por padrão) e o
    // focus animation faz o pan/zoom suave igual o ConnectScreen.
    // Hardcoded por enquanto · pode plugar redux user location se quiser.
    var activeLat: Double? by remember { mutableStateOf(null) }
    var activeLng: Double? by remember { mutableStateOf(null) }
    LaunchedEffect(Unit) {
        delay(1200)
        activeLat = -23.5505  // São Paulo · default seed
        activeLng = -46.6333
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF02080C)),
        contentAlignment = Alignment.Center,
    ) {
        // Mesmo globo R3F do ConnectScreen · WebViewGlobe via embedded bundle
        vu.vpn.lib.map.WebViewGlobe(
            activeLat = activeLat,
            activeLng = activeLng,
            connectionState = "idle",
            modifier = Modifier.fillMaxSize(),
        )

        // Dim overlay · escurece o globo pra logo/text ficarem legíveis
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.45f)),
        )

        // Centro · logo + brand + tagline + status
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            PulsingLogoMark()

            Spacer(modifier = Modifier.height(28.dp))

            Text(
                text = buildAnnotatedString {
                    withStyle(SpanStyle(color = Color.White, fontWeight = FontWeight.Black))
                    { append("VPN") }
                    withStyle(
                        SpanStyle(
                            color = Color(0xFF5BC8DA),
                            fontWeight = FontWeight.Black,
                        )
                    ) { append(".vu") }
                },
                fontSize = 40.sp,
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "YOUR VPN · NO NAME, NO TRACES",
                color = Color(0xFFDCEAF0).copy(alpha = 0.92f),
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                letterSpacing = 2.6.sp,
            )

            Spacer(modifier = Modifier.height(36.dp))

            StatusBlock()
        }

        // Footer "VPN.vu · vX · Android"
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 28.dp),
            contentAlignment = Alignment.BottomCenter,
        ) {
            Text(
                // Versão dinâmica: puxa do BuildConfig (versionName = appVersion.name)
                // pra o footer nunca ficar defasado do build real.
                text = "VPN.VU · V${BuildConfig.VERSION_NAME.uppercase()} · ANDROID",
                color = Color(0xFF9BAEB6).copy(alpha = 0.55f),
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium,
                letterSpacing = 2.sp,
            )
        }
    }
}

@Composable
private fun PulsingLogoMark() {
    val ring = rememberInfiniteTransition(label = "ringPulse")
    val ringScale by ring.animateFloat(
        initialValue = 1f,
        targetValue = 1.18f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2400, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "ringScale",
    )
    val ringAlpha by ring.animateFloat(
        initialValue = 0.45f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2400, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "ringAlpha",
    )

    Box(
        modifier = Modifier.size(132.dp),
        contentAlignment = Alignment.Center,
    ) {
        // Anel pulsante · cyan low-alpha
        Box(
            modifier = Modifier
                .size(132.dp)
                .scale(ringScale)
                .clip(CircleShape)
                .border(
                    width = 1.dp,
                    color = Color(0xFF5BC8DA).copy(alpha = ringAlpha),
                    shape = CircleShape,
                ),
        )
        // Logo vulcão branco
        Image(
            painter = painterResource(id = R.drawable.logo_icon),
            contentDescription = null,
            modifier = Modifier.size(96.dp),
        )
    }
}

@Composable
private fun StatusBlock() {
    val phase = useRotatingPhase(phaseCount = 4, intervalMs = 1250L)
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        SpinnerRing()
        Spacer(modifier = Modifier.height(14.dp))
        Text(
            text = connectingMessage(phase),
            color = Color.White.copy(alpha = 0.78f),
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            letterSpacing = 1.2.sp,
        )
    }
}

@Composable
private fun useRotatingPhase(phaseCount: Int, intervalMs: Long): Int {
    var phase by remember { mutableIntStateOf(0) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(intervalMs)
            phase = (phase + 1) % phaseCount
        }
    }
    return phase
}

private fun connectingMessage(phase: Int): String = when (phase) {
    0 -> "INITIALIZING SECURITY"
    1 -> "CONNECTING TO SERVICE"
    2 -> "LOADING RELAYS"
    else -> "ALMOST READY"
}

@Composable
private fun SpinnerRing() {
    val rotation = rememberInfiniteTransition(label = "spinner")
    val angle by rotation.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 850, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "spinnerAngle",
    )

    Canvas(
        modifier = Modifier
            .size(36.dp)
            .rotate(angle),
    ) {
        val stroke = 2.5.dp.toPx()
        // Anel base · alpha 18%
        drawCircle(
            color = Color(0xFF5BC8DA).copy(alpha = 0.18f),
            radius = size.minDimension / 2 - stroke / 2,
            center = Offset(size.width / 2, size.height / 2),
            style = Stroke(width = stroke),
        )
        // Arco superior · cyan glow · 90° arc no topo
        drawArc(
            color = Color(0xFF5BC8DA),
            startAngle = -90f,
            sweepAngle = 90f,
            useCenter = false,
            topLeft = Offset(stroke / 2, stroke / 2),
            size = Size(size.width - stroke, size.height - stroke),
            style = Stroke(width = stroke),
        )
    }
}

@Composable
private fun RotatingGlobeBackground() {
    val transition = rememberInfiniteTransition(label = "globeSpin")
    // Pan horizontal infinito da textura · simula rotação do globo no eixo Y.
    // 90s pra dar a volta · sutil, não cansa.
    val panProgress by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 90_000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "panProgress",
    )

    BoxWithConstraints(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        val density = LocalDensity.current
        val canvasMinDim = with(density) {
            minOf(maxWidth, maxHeight).toPx()
        }
        val globeSizePx = canvasMinDim * 1.24f
        val globeSizeDp = with(density) { globeSizePx.toDp() }
        // Continents-mask tem proporção 2:1 (equirectangular) · width 2x do height
        // ao mostrar dentro do círculo · pra tile no horizontal sem gap.
        val maskWidthDp = globeSizeDp * 2f

        Box(
            modifier = Modifier
                .size(globeSizeDp)
                .clip(CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            // Imagem do continents-mask · 2x width · animando offset X · cyan tinted
            Box(modifier = Modifier.fillMaxSize()) {
                val offsetX = with(density) {
                    (-panProgress * globeSizePx).toDp()
                }
                Image(
                    painter = painterResource(id = R.drawable.continents_mask),
                    contentDescription = null,
                    contentScale = ContentScale.FillBounds,
                    colorFilter = ColorFilter.tint(
                        color = Color(0xFF5BC8DA).copy(alpha = 0.65f)
                    ),
                    modifier = Modifier
                        .size(width = maskWidthDp, height = globeSizeDp)
                        .offset { IntOffset(offsetX.roundToPx(), 0) },
                )
            }

            // Overlay com paralelos/meridianos/atmosphere
            Canvas(modifier = Modifier.fillMaxSize()) {
                val cx = size.width / 2f
                val cy = size.height / 2f
                val radius = size.minDimension / 2f
                val cyanGlow = Color(0xFF5BC8DA).copy(alpha = 0.22f)
                val cyanFaint = Color(0xFF5BC8DA).copy(alpha = 0.12f)

                // Borda do globo
                drawCircle(
                    color = cyanGlow,
                    radius = radius * 0.99f,
                    center = Offset(cx, cy),
                    style = Stroke(width = 1.8f),
                )

                // Paralelos · 5 linhas horizontais elípticas
                for (i in 1..5) {
                    val ratio = i / 6f
                    val rY = radius * sin(Math.PI * ratio).toFloat()
                    drawOval(
                        color = cyanFaint,
                        topLeft = Offset(cx - radius, cy - rY),
                        size = Size(radius * 2f, rY * 2f),
                        style = Stroke(width = 0.9f),
                    )
                }

                // Meridianos · 7 elipses verticais
                for (i in 0 until 7) {
                    val theta = (i / 7f) * Math.PI
                    val rX = radius * cos(theta).toFloat()
                    drawOval(
                        color = cyanFaint,
                        topLeft = Offset(cx - abs(rX), cy - radius),
                        size = Size(abs(rX) * 2f, radius * 2f),
                        style = Stroke(width = 0.9f),
                    )
                }
            }
        }

        // Atmosphere halo · fora do clip · um anel sutil maior que o globo
        Canvas(modifier = Modifier.fillMaxSize()) {
            val cx = size.width / 2f
            val cy = size.height / 2f
            val r = canvasMinDim * 0.66f
            drawCircle(
                color = Color(0xFF5BC8DA).copy(alpha = 0.08f),
                radius = r,
                center = Offset(cx, cy),
                style = Stroke(width = 2.5f),
            )
        }
    }
}
