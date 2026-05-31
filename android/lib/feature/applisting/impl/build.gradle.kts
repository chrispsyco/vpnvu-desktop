plugins {
    alias(libs.plugins.mullvad.android.library)
    alias(libs.plugins.mullvad.android.library.feature.impl)
}

android { namespace = "vu.vpn.feature.applisting.impl" }

dependencies { implementation(projects.lib.feature.applisting.api) }
