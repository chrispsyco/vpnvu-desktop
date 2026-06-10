package vu.vpn.lib.common.util

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS
import android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS
import android.provider.Settings.ACTION_VPN_SETTINGS
import android.provider.Settings.EXTRA_APP_PACKAGE
import androidx.core.net.toUri
import arrow.core.Either
import co.touchlab.kermit.Logger
import vu.vpn.lib.model.WebsiteAuthToken

// PSYCO · `lang` carrega o idioma atual do app pro site abrir no mesmo locale.
// O site (proxy.ts) é a autoridade e colapsa o tag (ex: "pt-BR") pros idiomas
// que ele tem (en/pt/es); o resto cai em inglês. `lang` é opcional pra manter
// compat com chamadas antigas.
fun createAccountUri(
    accountUri: String,
    websiteAuthToken: WebsiteAuthToken?,
    lang: String? = null,
): Uri {
    val urlString = buildString {
        append(accountUri)
        val params =
            buildList {
                    websiteAuthToken?.let { add("token=${it.value}") }
                    if (!lang.isNullOrBlank()) add("lang=${Uri.encode(lang)}")
                }
                .joinToString("&")
        if (params.isNotEmpty()) {
            append("?")
            append(params)
        }
    }
    return urlString.toUri()
}

// Activity not found can be return if the device does not have system vpn settings available.
// This is the case for Android TV devices. In normal cases, this action should not be available
// for those devices (see SystemVpnSettingsAvailableUseCase). This is an extra safety check.

fun Context.openVpnSettings(): Either<ActivityNotFoundException, Unit> =
    Either.catch {
            val intent = Intent(ACTION_VPN_SETTINGS)
            startActivity(intent)
        }
        .onLeft { Logger.e("Failed to open VPN settings", it) }
        .mapLeft { it as? ActivityNotFoundException ?: throw it }

fun Context.openAppDetailsSettings(): Either<ActivityNotFoundException, Unit> =
    Either.catch {
            val intent = Intent(ACTION_APPLICATION_DETAILS_SETTINGS, "package:$packageName".toUri())
            startActivity(intent)
        }
        .onLeft { Logger.e("Failed to open app details settings", it) }
        .mapLeft { it as? ActivityNotFoundException ?: throw it }

fun Context.openAppInfoNotificationSettings(): Either<ActivityNotFoundException, Unit> =
    Either.catch {
            val intent = Intent(ACTION_APP_NOTIFICATION_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            intent.putExtra(EXTRA_APP_PACKAGE, packageName)
            startActivity(intent)
        }
        .onLeft { Logger.e("Failed to open app info notification settings", it) }
        .mapLeft { it as? ActivityNotFoundException ?: throw it }
