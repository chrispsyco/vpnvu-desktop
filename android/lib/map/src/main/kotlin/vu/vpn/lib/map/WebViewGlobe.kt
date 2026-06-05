package vu.vpn.lib.map

import android.annotation.SuppressLint
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import co.touchlab.kermit.Logger
import java.io.IOException

/**
 * PSYCO · embed do globo R3F desktop dentro de WebView pra match visual 1-pra-1.
 *
 * O bundle JS (gerado a partir do `desktop/packages/mullvad-vpn/globe-bundle/`)
 * fica em `app/src/main/assets/globe/`. Ao carregar, expõe `window.GlobeAPI`
 * com 3 métodos · setLocation, setConnectionState, clear.
 *
 * Tipos do connectionState aceitos pelo JS: "idle" | "connecting" | "connected"
 * | "error".
 *
 * PSYCO · a WebView vive num holder de processo ([GlobeWebViewHolder]) em vez de
 * ser criada/destruída a cada composição. Sem isso, navegar pra Conta/Settings e
 * voltar destruía a WebView e recarregava o bundle inteiro (o globo sumia, as
 * estrelas carregavam e só então o globo voltava). Agora a MESMA WebView é só
 * desanexada (onPause) e reanexada (onResume) — fica sempre carregada.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebViewGlobe(
    activeLat: Double?,
    activeLng: Double?,
    connectionState: String,
    modifier: Modifier = Modifier,
) {
    var isReady by remember { mutableStateOf(GlobeWebViewHolder.isReady) }

    DisposableEffect(Unit) {
        val listener = { isReady = true }
        GlobeWebViewHolder.addReadyListener(listener)
        onDispose { GlobeWebViewHolder.removeReadyListener(listener) }
    }

    AndroidView(
        modifier = modifier.fillMaxSize(),
        factory = { ctx ->
            val webView = GlobeWebViewHolder.obtain(ctx.applicationContext)
            // A WebView é reusada · garante que não tem um parent antigo pendurado
            // antes de o AndroidView reanexar, senão crasha ("already has a parent").
            (webView.parent as? ViewGroup)?.removeView(webView)
            GlobeWebViewHolder.onAttached()
            webView
        },
        onRelease = { GlobeWebViewHolder.onDetached() },
    )

    // Sempre que o estado muda (ou a WebView fica ready), empurra os comandos JS.
    LaunchedEffect(activeLat, activeLng, connectionState, isReady) {
        if (!isReady) return@LaunchedEffect
        val cmds = buildList {
            if (
                activeLat != null &&
                    activeLng != null &&
                    activeLat.isFinite() &&
                    activeLng.isFinite()
            ) {
                add("window.GlobeAPI.setLocation($activeLat, $activeLng);")
            } else {
                add("window.GlobeAPI.clear();")
            }
            add("window.GlobeAPI.setConnectionState('${escapeJs(connectionState)}');")
        }
        GlobeWebViewHolder.evaluate("if (window.GlobeAPI) { ${cmds.joinToString("\n")} }")
    }
}

/**
 * Mantém uma única WebView do globo viva pelo processo todo, pra ela não
 * recarregar entre navegações. Usa applicationContext pra não vazar a Activity.
 */
@SuppressLint("StaticFieldLeak")
private object GlobeWebViewHolder {
    // Servido via origin appassets.androidplatform.net (Chromium considera válida ·
    // permite ES modules e fetch same-origin dos assets do bundle).
    private const val BUNDLE_URL = "https://appassets.androidplatform.net/assets/globe/index.html"

    private val mainHandler = Handler(Looper.getMainLooper())
    private var webView: WebView? = null
    private val readyListeners = mutableSetOf<() -> Unit>()

    // Quantas telas (AndroidView) estão usando a WebView agora. Ao navegar entre
    // telas com globo (ex.: Splash → Connect) o destino novo anexa a MESMA WebView
    // (mesmo holder) antes — ou logo depois — de o onRelease da tela antiga rodar.
    // Pausar incondicionalmente no onRelease pausava o RENDERING do Chromium na
    // tela nova → globo preto no Connect até abrir Settings e voltar (que
    // re-chamava onResume). Só pausamos quando NINGUÉM está usando a WebView.
    private var attachCount = 0

    var isReady: Boolean = false
        private set

    fun addReadyListener(listener: () -> Unit) {
        readyListeners.add(listener)
        if (isReady) listener()
    }

    fun removeReadyListener(listener: () -> Unit) {
        readyListeners.remove(listener)
    }

    fun onAttached() {
        attachCount++
        webView?.onResume()
    }

    fun onDetached() {
        attachCount = (attachCount - 1).coerceAtLeast(0)
        // Adia a decisão pro fim do frame: se foi uma troca de telas, o factory do
        // destino novo já terá incrementado attachCount quando este post rodar.
        mainHandler.post {
            if (attachCount == 0) {
                val wv = webView ?: return@post
                (wv.parent as? ViewGroup)?.removeView(wv)
                wv.onPause()
            }
        }
    }

    fun evaluate(script: String) {
        mainHandler.post { webView?.evaluateJavascript(script, null) }
    }

    // markReady pode vir da thread do JavascriptInterface ou de onPageFinished ·
    // sempre marshala pra main thread (mexe em Compose state via listeners).
    private fun markReady() {
        mainHandler.post {
            if (isReady) return@post
            isReady = true
            readyListeners.toList().forEach { it() }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    fun obtain(appContext: Context): WebView {
        webView?.let {
            return it
        }
        WebView.setWebContentsDebuggingEnabled(true)
        val created =
            WebView(appContext).apply {
                layoutParams =
                    ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT,
                    )
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = true
                settings.allowContentAccess = true
                setLayerType(View.LAYER_TYPE_HARDWARE, null)
                setBackgroundColor(android.graphics.Color.TRANSPARENT)

                addJavascriptInterface(GlobeBridge(onReady = { markReady() }), "AndroidGlobe")

                webViewClient =
                    object : WebViewClient() {
                        override fun shouldInterceptRequest(
                            view: WebView,
                            request: WebResourceRequest,
                        ): WebResourceResponse? {
                            val url = request.url
                            if (
                                url.host == "appassets.androidplatform.net" &&
                                    url.path?.startsWith("/assets/") == true
                            ) {
                                return tryServeAsset(appContext, url.path!!.removePrefix("/assets/"))
                            }
                            return null
                        }

                        override fun onPageFinished(view: WebView?, url: String?) {
                            super.onPageFinished(view, url)
                            Logger.i("WebViewGlobe: onPageFinished url=$url")
                            markReady()
                        }

                        override fun onReceivedError(
                            view: WebView?,
                            request: WebResourceRequest?,
                            error: WebResourceError?,
                        ) {
                            Logger.e(
                                "WebViewGlobe: load error " +
                                    "url=${request?.url} " +
                                    "code=${error?.errorCode} " +
                                    "desc=${error?.description}"
                            )
                        }
                    }

                webChromeClient =
                    object : WebChromeClient() {
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
            }
        webView = created
        return created
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
 * Retorna null se o arquivo não existir.
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

private fun mimeFromExtension(path: String): String =
    when {
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
