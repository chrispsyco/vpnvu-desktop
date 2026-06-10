package vu.vpn.common.compose

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.UriHandler
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.intl.Locale
import arrow.core.Either
import co.touchlab.kermit.Logger
import vu.vpn.lib.common.util.createAccountUri
import vu.vpn.lib.model.WebsiteAuthToken
import vu.vpn.lib.ui.resource.R

@Composable
fun UriHandler.createOpenAccountPageHook(): (WebsiteAuthToken?) -> Unit {
    val accountUrl = stringResource(id = R.string.account_url)
    // PSYCO · idioma atual do app (ex: "pt-BR") vai junto pro site abrir no
    // mesmo locale. O site (proxy.ts) colapsa pros idiomas que ele tem.
    val lang = Locale.current.toLanguageTag()
    return { token ->
        val accountUri = createAccountUri(accountUrl, token, lang).toString()
        safeOpenUri(accountUri)
    }
}

fun UriHandler.createUriHook(uri: String): () -> Unit = { safeOpenUri(uri) }

fun UriHandler.safeOpenUri(uri: String): Either<IllegalArgumentException, Unit> =
    try {
        Either.Right(openUri(uri))
    } catch (e: IllegalArgumentException) {
        // E.g user has no browser or invalid uri
        Logger.e("Failed to open uri: $uri", e)
        Either.Left(e)
    }
