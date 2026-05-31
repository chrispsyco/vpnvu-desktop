plugins { alias(libs.plugins.mullvad.android.library.feature.api) }

android { namespace = "vu.vpn.feature.apiaccess.api" }

dependencies { implementation(projects.lib.model) }
