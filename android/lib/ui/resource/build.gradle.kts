plugins {
    alias(libs.plugins.mullvad.android.library)
    alias(libs.plugins.kotlin.parcelize)
}

android { namespace = "vu.vpn.lib.ui.resource" }

dependencies {
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.coresplashscreen)
    implementation(libs.compose.ui)
}
