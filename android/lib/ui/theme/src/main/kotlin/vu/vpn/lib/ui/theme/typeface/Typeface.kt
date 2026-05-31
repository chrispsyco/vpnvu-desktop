package vu.vpn.lib.ui.theme.typeface

import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import vu.vpn.lib.ui.resource.R

// PSYCO · Geist (Vercel · OFL) substitui Open Sans/Roboto default do Mullvad.
// Variable-equivalent não suportado em FontFamily Compose direto · usamos 3 pesos estáticos.
val GeistFontFamily =
    FontFamily(
        Font(R.font.geist_regular, FontWeight.Normal),
        Font(R.font.geist_semibold, FontWeight.SemiBold),
        Font(R.font.geist_bold, FontWeight.Bold),
    )

val GeistMonoFontFamily =
    FontFamily(Font(R.font.geist_mono_regular, FontWeight.Normal))
