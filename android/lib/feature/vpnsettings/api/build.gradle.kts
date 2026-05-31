plugins { alias(libs.plugins.mullvad.android.library.feature.api) }

android { namespace = "vu.vpn.feature.vpnsettings.api" }

dependencies { implementation(projects.lib.model) }
