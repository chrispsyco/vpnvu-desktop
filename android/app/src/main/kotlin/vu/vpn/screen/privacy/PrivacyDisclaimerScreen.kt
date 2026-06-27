package vu.vpn.screen.privacy

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import vu.vpn.app.MainActivity
import vu.vpn.common.compose.CollectSideEffectWithLifecycle
import vu.vpn.core.Navigator
import vu.vpn.feature.login.api.LoginNavKey
import vu.vpn.lib.ui.resource.R
import vu.vpn.lib.ui.designsystem.Checkbox
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorMedium
import vu.vpn.lib.ui.designsystem.PrimaryButton
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.screen.navigation.SplashNavKey
import vu.vpn.screen.splash.DAEMON_READY_TIMEOUT_MS
import org.koin.androidx.compose.koinViewModel

/**
 * PSYCO · Privacy disclaimer wizard 2 steps · portado 1-pra-1 do
 * `views/privacy-disclaimer` do desktop. Step 1 (Privacidade) + Step 2
 * (Termos & LGPD). CTAs liberam após o usuário rolar até o fim do conteúdo
 * (`READ_THRESHOLD = 0.92`).
 */

private const val READ_THRESHOLD = 0.92f
private const val TOTAL_STEPS = 2

private data class StepMeta(
    val headerLabel: Int,
    val kicker: Int,
    val titleLead: Int,
    val titleAccent: Int,
)

private val STEP_META = mapOf(
    1 to StepMeta(
        headerLabel = R.string.psyco_privacy_step1_label,
        kicker = R.string.psyco_privacy_step1_kicker,
        titleLead = R.string.psyco_privacy_step1_title_lead,
        titleAccent = R.string.psyco_privacy_step1_title_accent,
    ),
    2 to StepMeta(
        headerLabel = R.string.psyco_privacy_step2_label,
        kicker = R.string.psyco_privacy_step2_kicker,
        titleLead = R.string.psyco_privacy_step2_title_lead,
        titleAccent = R.string.psyco_privacy_step2_title_accent,
    ),
)

@Preview
@Composable
private fun PreviewPrivacyDisclaimerScreen() {
    AppTheme {
        PrivacyDisclaimerScreen(
            state = PrivacyDisclaimerViewState(isStartingService = false, isPlayBuild = false),
            onAcceptClicked = {},
        )
    }
}

@Composable
fun PrivacyDisclaimer(navigator: Navigator) {
    val viewModel: PrivacyDisclaimerViewModel = koinViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    val context = LocalContext.current

    // Pedimos POST_NOTIFICATIONS no aceite do onboarding (Android 13+) em vez
    // de só "quando o serviço conecta" — esse momento é claro e o usuário não
    // perde/nega o diálogo sem querer. Seguimos pro accept independente da
    // resposta: a notificação de status é desejável, mas a permissão não é
    // pré-requisito do túnel. Se negada, o banner da home (NotificationPermission
    // use case) orienta a reativar nas configurações.
    val notificationPermissionLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { _ ->
            viewModel.setPrivacyDisclosureAccepted()
        }

    val onAccept: () -> Unit = {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            viewModel.setPrivacyDisclosureAccepted()
        }
    }

    CollectSideEffectWithLifecycle(viewModel.uiSideEffect) {
        when (it) {
            PrivacyDisclaimerUiSideEffect.NavigateToLogin ->
                navigator.navigate(LoginNavKey(), clearBackStack = true)
            PrivacyDisclaimerUiSideEffect.StartService ->
                launch {
                    try {
                        withTimeout(DAEMON_READY_TIMEOUT_MS) {
                            (context as MainActivity).bindService()
                        }
                        viewModel.onServiceStartedSuccessful()
                    } catch (e: CancellationException) {
                        viewModel.onServiceStartedTimeout()
                    }
                }
            PrivacyDisclaimerUiSideEffect.NavigateToSplash -> navigator.navigate(SplashNavKey)
        }
    }
    PrivacyDisclaimerScreen(
        state = state,
        onAcceptClicked = onAccept,
    )
}

@Composable
fun PrivacyDisclaimerScreen(state: PrivacyDisclaimerViewState, onAcceptClicked: () -> Unit) {
    var currentStep by remember { mutableIntStateOf(1) }
    var hasReadAll by remember { mutableStateOf(false) }
    // Rolar até o fim apenas LIBERA o checkbox; o aceite exige o usuário marcá-lo
    // manualmente (ação afirmativa exigida pela política do Google Play).
    var hasAgreed by remember { mutableStateOf(false) }
    val scrollState = rememberScrollState()

    // Resetar scroll + read state + aceite quando avança step
    LaunchedEffect(currentStep) {
        scrollState.scrollTo(0)
        hasReadAll = false
        hasAgreed = false
    }

    // Detectar leitura completa (READ_THRESHOLD) · também unlocka se conteúdo
    // for menor que a viewport (não tem scroll possível)
    LaunchedEffect(scrollState) {
        snapshotFlow { Triple(scrollState.value, scrollState.maxValue, currentStep) }
            .collectLatest { (value, max, _) ->
                if (max <= 1) {
                    hasReadAll = true
                } else {
                    val progress = value.toFloat() / max
                    if (progress >= READ_THRESHOLD) hasReadAll = true
                }
            }
    }

    val bgGradient = Brush.verticalGradient(
        0.0f to Color(0xFF06181E),
        0.5f to Color(0xFF030C0F),
        1.0f to Color(0xFF06181E),
    )

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFF030C0F),
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(bgGradient)
                .systemBarsPadding()
                .padding(horizontal = 20.dp, vertical = 16.dp),
        ) {
            HeaderRow(currentStep)
            Spacer(Modifier.height(24.dp))
            Hero(currentStep)
            Spacer(Modifier.height(20.dp))

            Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                ScrollableContent(currentStep, scrollState)
            }

            Spacer(Modifier.height(12.dp))
            AgreementRow(
                canAgree = hasReadAll,
                isChecked = hasAgreed,
                onCheckedChange = { hasAgreed = it },
            )
            Spacer(Modifier.height(16.dp))
            CtaGroup(
                currentStep = currentStep,
                canProceed = hasAgreed,
                isStartingService = state.isStartingService,
                onAdvance = { currentStep = (currentStep + 1).coerceAtMost(TOTAL_STEPS) },
                onFinalAccept = onAcceptClicked,
            )
        }
    }
}

@Composable
private fun HeaderRow(currentStep: Int) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = buildAnnotatedString {
                withStyle(SpanStyle(color = Color.White, fontWeight = FontWeight.SemiBold)) {
                    append("VPN")
                }
                withStyle(
                    SpanStyle(
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.SemiBold,
                    )
                ) {
                    append(".vu")
                }
            },
            fontSize = 22.sp,
        )
        val headerLabel = STEP_META[currentStep]?.headerLabel?.let { stringResource(it) } ?: ""
        Text(
            text = buildAnnotatedString {
                withStyle(
                    SpanStyle(color = Color.White, fontWeight = FontWeight.SemiBold)
                ) { append(currentStep.toString()) }
                // Android trims the leading space from the string resource, gluing the
                // number to "de" ("1de 2"). Emit the separator here instead.
                append(" ")
                withStyle(SpanStyle(color = Color(0xFF9BAEB6))) {
                    append(stringResource(R.string.psyco_privacy_step_suffix, TOTAL_STEPS, headerLabel))
                }
            },
            fontSize = 12.sp,
        )
    }
}

@Composable
private fun Hero(currentStep: Int) {
    val meta = STEP_META[currentStep] ?: return
    Column {
        Text(
            text = stringResource(meta.kicker).uppercase(),
            color = MaterialTheme.colorScheme.primary,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
        )
        Spacer(Modifier.height(10.dp))
        Text(
            text = buildAnnotatedString {
                withStyle(SpanStyle(color = Color.White)) { append(stringResource(meta.titleLead)) }
                // Android trims trailing whitespace from string resources, which glued the
                // lead to the accent ("gentecomeçar"). Emit the separator here so the space
                // is guaranteed for every step regardless of the resource value.
                append(" ")
                withStyle(
                    SpanStyle(
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold,
                    )
                ) { append(stringResource(meta.titleAccent)) }
            },
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            lineHeight = 32.sp,
        )
    }
}

@Composable
private fun ScrollableContent(currentStep: Int, scrollState: androidx.compose.foundation.ScrollState) {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFF0A2128).copy(alpha = 0.6f),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(18.dp),
        ) {
            when (currentStep) {
                1 -> PrivacyStepContent()
                2 -> TermsStepContent()
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun PrivacyStepContent() {
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s1_essential_h),
        body = stringResource(id = R.string.psyco_privacy_s1_essential_b),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s1_nologs_h),
        body = stringResource(id = R.string.psyco_privacy_s1_nologs_b),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s1_crypto_h),
        body = stringResource(id = R.string.psyco_privacy_s1_crypto_b),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s1_collect_h),
        body = stringResource(id = R.string.psyco_privacy_s1_collect_b),
        bigHeadline = stringResource(id = R.string.psyco_privacy_s1_collect_big),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s1_apps_h),
        body = stringResource(id = R.string.psyco_privacy_s1_apps_b),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s1_id_h),
        body = stringResource(id = R.string.psyco_privacy_s1_id_b),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s1_payment_h),
        body = stringResource(id = R.string.psyco_privacy_s1_payment_b),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s1_jurisdiction_h),
        body = stringResource(id = R.string.psyco_privacy_s1_jurisdiction_b),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s1_opensource_h),
        body = stringResource(id = R.string.psyco_privacy_s1_opensource_b),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s1_last_h),
        body = stringResource(id = R.string.psyco_privacy_s1_last_b),
    )
}

@Composable
private fun TermsStepContent() {
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s2_lgpd_h),
        body = stringResource(id = R.string.psyco_privacy_s2_lgpd_b),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s2_dpo_h),
        body = stringResource(id = R.string.psyco_privacy_s2_dpo_b),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s2_sharing_h),
        body = stringResource(id = R.string.psyco_privacy_s2_sharing_b),
        bigHeadline = stringResource(id = R.string.psyco_privacy_s2_sharing_big),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s2_acceptable_h),
        body = stringResource(id = R.string.psyco_privacy_s2_acceptable_b),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s2_transparency_h),
        body = stringResource(id = R.string.psyco_privacy_s2_transparency_b),
    )
    DisclaimerSection(
        heading = stringResource(id = R.string.psyco_privacy_s2_forum_h),
        body = stringResource(id = R.string.psyco_privacy_s2_forum_b),
    )
}

@Composable
private fun DisclaimerSection(heading: String, body: String, bigHeadline: String? = null) {
    Column(modifier = Modifier.padding(bottom = 18.dp)) {
        Text(
            text = heading,
            color = MaterialTheme.colorScheme.primary,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
        )
        Spacer(Modifier.height(6.dp))
        if (bigHeadline != null) {
            Text(
                text = bigHeadline,
                color = Color(0xFF44AD4D),
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(8.dp))
        }
        Text(
            text = body,
            color = Color(0xFFCFD8DC),
            fontSize = 13.sp,
            lineHeight = 19.sp,
        )
    }
}

@Composable
private fun AgreementRow(
    canAgree: Boolean,
    isChecked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    // Antes de rolar até o fim o checkbox fica desabilitado (acinzentado) e a
    // linha mostra a dica de rolar. Depois de liberado, o usuário precisa
    // marcar — rolar NÃO marca sozinho.
    val alpha by animateFloatAsState(targetValue = if (canAgree) 1f else 0.7f, label = "agreeAlpha")
    val label =
        if (canAgree) stringResource(id = R.string.psyco_privacy_agree_checkbox)
        else stringResource(id = R.string.psyco_privacy_read_scroll)
    Row(
        modifier =
            Modifier.fillMaxWidth()
                .alpha(alpha)
                .then(
                    if (canAgree) Modifier.clickable { onCheckedChange(!isChecked) }
                    else Modifier
                )
                .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Checkbox(
            checked = isChecked,
            onCheckedChange = if (canAgree) onCheckedChange else null,
            enabled = canAgree,
            colors =
                CheckboxDefaults.colors(
                    checkedColor = MaterialTheme.colorScheme.primary,
                    uncheckedColor = Color(0xFF9BAEB6),
                    checkmarkColor = Color.White,
                ),
        )
        Spacer(Modifier.width(8.dp))
        Text(
            text = label,
            color = if (canAgree) Color.White else Color(0xFF9BAEB6),
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

@Composable
private fun CtaGroup(
    currentStep: Int,
    canProceed: Boolean,
    isStartingService: Boolean,
    onAdvance: () -> Unit,
    onFinalAccept: () -> Unit,
) {
    val isFinal = currentStep == TOTAL_STEPS
    val primaryLabel = when {
        isFinal -> stringResource(id = R.string.psyco_privacy_cta_start)
        else -> stringResource(id = R.string.psyco_privacy_cta_continue)
    }

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        if (isStartingService) {
            MullvadCircularProgressIndicatorMedium()
        } else {
            val onClickAction: () -> Unit = {
                if (canProceed) {
                    if (isFinal) onFinalAccept() else onAdvance()
                }
            }
            PrimaryButton(
                text = primaryLabel,
                onClick = onClickAction,
                isEnabled = canProceed,
            )
        }
    }
}
