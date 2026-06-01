package vu.vpn.screen.nodaemon

import androidx.activity.compose.BackHandler
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.core.app.ActivityCompat.finishAffinity
import vu.vpn.core.Navigator
import vu.vpn.screen.splash.SplashScreen

// Start destination enquanto o daemon ainda não está conectado — inclusive ao
// retomar o app pela lista de recentes (o Android recriou a Activity e o
// serviço precisa reconectar). PSYCO · mostra a MESMA splash da inicial (globo
// R3F + logo VPN.vu pulsante + status), em vez da antiga tela com branding
// Mullvad (launch_logo / logo_text / "serviço Mullvad"). `getActivity()` vem
// de ContextExtensions.kt no mesmo package.
@Composable
fun NoDaemon(navigator: Navigator) {
    val context = LocalContext.current
    BackHandler { finishAffinity(context.getActivity()!!) }
    SplashScreen()
}
