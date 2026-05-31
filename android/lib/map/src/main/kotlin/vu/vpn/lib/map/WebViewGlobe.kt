package vu.vpn.lib.map

import android.annotation.SuppressLint
import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import co.touchlab.kermit.Logger
import java.io.IOException
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

/**
 * PSYCO · embed do globo R3F desktop dentro de WebView pra match visual 1-pra-1.
 *
 * O bundle JS (gerado a partir do `desktop/packages/mullvad-vpn/globe-bundle/`)
 * fica em `app/src/main/assets/globe/`. Ao carregar, expõe `window.GlobeAPI`
 * com 3 métodos · setLocation, setConnectionState, clear.
 *
 * Tipos do connectionState aceitos pelo JS:
 *   - "idle"
 *   - "connecting"
 *   - "connected"
 *   - "error"
 *
 * Recursos defensivos no bundle JS (ver globe-bundle/main.tsx):
 *   - sessionStorage persistence · state sobrevive WebView reload
 *   - visibilitychange auto-pause via usePauseWhenHidden upstream
 *   - ErrorBoundary captura crashes do R3F sem matar a WebView
 *   - stub de window.electron defensive
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebViewGlobe(
    activeLat: Double?,
    activeLng: Double?,
    connectionState: String,
    modifier: Modifier = Modifier,
) {
    var isReady by remember { mutableStateOf(false) }
    val pendingCommands = remember { ArrayDeque<String>() }
    var webViewRef by remember { mutableStateOf<WebView?>(null) }

    AndroidView(
        modifier = modifier.fillMaxSize(),
        factory = { context ->
            // PSYCO · habilita chrome://inspect debugging do WebView · útil em dev,
            // sem efeito em release. Mantém ligado por enquanto.
            WebView.setWebContentsDebuggingEnabled(true)
            WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT,
                )
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = true
                settings.allowContentAccess = true
                // Hardware acceleration · default desde API 18
                setLayerType(View.LAYER_TYPE_HARDWARE, null)
                // PSYCO · WebView transparent · evita "tela preta" enquanto o JS
                // carrega · UI Compose por baixo (deep navy) fica visível
                // imediatamente · WebView aparece quando JS bootar.
                setBackgroundColor(android.graphics.Color.TRANSPARENT)

                addJavascriptInterface(
                    GlobeBridge(
                        onReady = {
                            isReady = true
                        },
                    ),
                    "AndroidGlobe",
                )

                // PSYCO · serve assets do bundle do globo via https://appassets.androidplatform.net/
                // (origin valida · permite ES modules e fetch same-origin) interceptando requests
                // manualmente · NÃO usa androidx.webkit (verification-metadata bloqueava dep nova).
                val appContext = context.applicationContext

                webViewClient = object : WebViewClient() {
                    override fun shouldInterceptRequest(
                        view: WebView,
                        request: WebResourceRequest,
                    ): WebResourceResponse? {
                        val url = request.url
                        if (url.host == "appassets.androidplatform.net" &&
                            url.path?.startsWith("/assets/") == true) {
                            return tryServeAsset(appContext, url.path!!.removePrefix("/assets/"))
                        }
                        return null
                    }

                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        Logger.i("WebViewGlobe: onPageFinished url=$url")
                        view?.postDelayed({ isReady = true }, 50)
                    }

                    override fun onReceivedError(
                        view: WebView?,
                        request: android.webkit.WebResourceRequest?,
                        error: android.webkit.WebResourceError?,
                    ) {
                        Logger.e(
                            "WebViewGlobe: load error " +
                                "url=${request?.url} " +
                                "code=${error?.errorCode} " +
                                "desc=${error?.description}"
                        )
                    }
                }

                // PSYCO · captura console.log/error do JS pra logcat
                webChromeClient = object : WebChromeClient() {
                    override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                        val msg = consoleMessage ?: return false
                        Logger.i(
                            "WebViewGlobe[JS:${msg.messageLevel().name}]: " +
                                "${msg.message()} @ ${msg.sourceId()}:${msg.lineNumber()}"
                        )
                        return true
                    }
                }

                loadUrl(BUNDLE_URL)
                webViewRef = this
            }
        },
    )

    // Quando state muda · enfileira comando JS · dispara só depois de ready
    LaunchedEffect(activeLat, activeLng, connectionState, isReady) {
        val cmds = buildList {
            if (activeLat != null && activeLng != null && activeLat.isFinite() && activeLng.isFinite()) {
                add("window.GlobeAPI.setLocation($activeLat, $activeLng);")
            } else {
                add("window.GlobeAPI.clear();")
            }
            add("window.GlobeAPI.setConnectionState('${escapeJs(connectionState)}');")
        }

        if (isReady) {
            val wv = webViewRef ?: return@LaunchedEffect
            val script = cmds.joinToString("\n")
            wv.evaluateJavascript("if (window.GlobeAPI) { $script }", null)
        } else {
            pendingCommands.clear()
            pendingCommands.addAll(cmds)
        }
    }

    // Quando vira ready · drain pending commands
    LaunchedEffect(isReady) {
        if (isReady && pendingCommands.isNotEmpty()) {
            val wv = webViewRef ?: return@LaunchedEffect
            val script = pendingCommands.joinToString("\n")
            pendingCommands.clear()
            wv.evaluateJavascript("if (window.GlobeAPI) { $script }", null)
        }
    }

    // Cleanup · pausar a WebView quando o composable sai · economia de bateria
    DisposableEffect(Unit) {
        onDispose {
            webViewRef?.let {
                it.onPause()
                it.removeJavascriptInterface("AndroidGlobe")
                it.destroy()
            }
            webViewRef = null
        }
    }
}

private class GlobeBridge(private val onReady: () -> Unit) {
    @JavascriptInterface
    fun onReady() {
        onReady.invoke()
    }
}

private fun escapeJs(s: String): String =
    s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")

/**
 * Serve um arquivo de `app/src/main/assets/<path>` como WebResourceResponse.
 * Retorna null se o arquivo não existir · WebView então segue o fluxo normal
 * (que falha · não cai em fallback HTTP).
 */
private fun tryServeAsset(context: Context, assetPath: String): WebResourceResponse? {
    return try {
        val input = context.assets.open(assetPath)
        val mime = mimeFromExtension(assetPath)
        WebResourceResponse(mime, "UTF-8", input)
    } catch (e: IOException) {
        Logger.e("WebViewGlobe: asset not found · $assetPath · ${e.message}")
        null
    }
}

private fun mimeFromExtension(path: String): String = when {
    path.endsWith(".html") || path.endsWith(".htm") -> "text/html"
    path.endsWith(".js") || path.endsWith(".mjs") -> "application/javascript"
    path.endsWith(".css") -> "text/css"
    path.endsWith(".json") -> "application/json"
    path.endsWith(".png") -> "image/png"
    path.endsWith(".jpg") || path.endsWith(".jpeg") -> "image/jpeg"
    path.endsWith(".svg") -> "image/svg+xml"
    path.endsWith(".woff2") -> "font/woff2"
    path.endsWith(".woff") -> "font/woff"
    path.endsWith(".ttf") -> "font/ttf"
    else -> "application/octet-stream"
}

// PSYCO · servido via WebViewAssetLoader · origin appassets.androidplatform.net
// é considerada válida pelo Chromium · permite ES modules e fetch de recursos
// no mesmo origin (continents-mask.png, countries-50m.json).
private const val BUNDLE_URL = "https://appassets.androidplatform.net/assets/globe/index.html"
