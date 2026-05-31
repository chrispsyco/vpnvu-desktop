package vu.vpn.lib.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.font.FontWeight
import vu.vpn.lib.ui.theme.typeface.GeistFontFamily

/*
The app currently uses the following text styles directly in the code:
headlineLarge (32sp 700 weight) -> Used for title in PrivacyDisclaimer, Welcome and Login
headlineSmall (24sp 600 weight) -> Used for title in OutOfTime, DeviceRevoked, ReportAProblem etc
titleLarge (22sp 600 weight) -> Used for Connection status and location
titleMedium (16sp 600 weight) -> Used for cell header text and button text
bodyLarge (16sp 400 weight) -> Used for title in two row cells and some other non-standard cells
bodyMedium (14sp 400 weight) -> Used for descriptions in screens and descriptions for cells
bodySmall (12sp 400 weight) -> Disclaimer texts and error texts under inputs
labelLarge (14sp 500 weight) -> Cell that are not header cells, Dialog texts, device name and expiry
 */

// PSYCO · aplica Geist como fontFamily default em todos os estilos · mantem
// metricas e pesos do Material3 default.
internal val MullvadMaterial3Typography =
    with(Typography()) {
        copy(
            displayLarge = displayLarge.copy(fontFamily = GeistFontFamily),
            displayMedium = displayMedium.copy(fontFamily = GeistFontFamily),
            displaySmall = displaySmall.copy(fontFamily = GeistFontFamily),
            headlineLarge = headlineLarge.merge(fontWeight = FontWeight.Bold).copy(fontFamily = GeistFontFamily),
            headlineMedium = headlineMedium.copy(fontFamily = GeistFontFamily),
            headlineSmall = headlineSmall.merge(fontWeight = FontWeight.SemiBold).copy(fontFamily = GeistFontFamily),
            titleLarge = titleLarge.merge(fontWeight = FontWeight.SemiBold).copy(fontFamily = GeistFontFamily),
            titleMedium = titleMedium.merge(fontWeight = FontWeight.SemiBold).copy(fontFamily = GeistFontFamily),
            titleSmall = titleSmall.copy(fontFamily = GeistFontFamily),
            bodyLarge = bodyLarge.copy(fontFamily = GeistFontFamily),
            bodyMedium = bodyMedium.copy(fontFamily = GeistFontFamily),
            bodySmall = bodySmall.copy(fontFamily = GeistFontFamily),
            labelLarge = labelLarge.copy(fontFamily = GeistFontFamily),
            labelMedium = labelMedium.copy(fontFamily = GeistFontFamily),
            labelSmall = labelSmall.copy(fontFamily = GeistFontFamily),
        )
    }
