package vu.vpn.lib.ui.theme.color

import androidx.compose.ui.graphics.Color

internal object PaletteTokens {

    // Brand · paleta VPN.vu cyan
    // Nomes preservados (Blue, DarkBlue, MullvadWhite) por compatibilidade
    // com tokens referenciados em ColorDarkTokens/ColorLightTokens.

    // Cyan primary · era Blue (#294D73)
    val Blue = Color(0xFF099EB4)
    // Cyan deep surface · era DarkBlue (#192E45)
    val DarkBlue = Color(0xFF0A2128)
    // Status (mantidos · vermelho/verde universais)
    val Red = Color(0xFFE34039)
    val Green = Color(0xFF44AD4D)

    // Accent / decorative · era Mole mascot palette
    val Nose = Color(0xFF4DD0E1)
    val Fur = Color(0xFF089DB3)
    val Yellow = Color(0xFFFFD524)

    // Backgrounds escuros · usados em cards/container
    val DarkerBlue10 = Color(0xFF030C0F)
    val DarkerBlue50 = Color(0xFF06181E)

    // On-surface · texto sobre fundo escuro · era MullvadWhite #F8F7F1
    val MullvadWhite = Color(0xFFE6F3F5)
    val White = Color(0xFFFFFFFF)

    // Black
    val Black = Color(0xFF000000)

    // Disabled container colors · derivadas da paleta cyan
    val DisabledContainerPrimary = Color(0xFF06434E)
    val DisabledContainerTertiary = Color(0xFF285F4D)
    val DisabledContainerDestructive = Color(0xFF6A3540)
}
