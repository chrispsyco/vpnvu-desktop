plugins {
    alias(libs.plugins.mullvad.android.library)
    alias(libs.plugins.compose)
}

android {
    namespace = "vu.vpn.lib.ui.theme"

    buildFeatures { compose = true }
}

dependencies {
    implementation(projects.lib.ui.resource)
    implementation(libs.compose.material3)
    implementation(libs.compose.ui)
    implementation(libs.kotlin.stdlib)
}
