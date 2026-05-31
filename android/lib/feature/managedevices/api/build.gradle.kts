plugins { alias(libs.plugins.mullvad.android.library.feature.api) }

android { namespace = "vu.vpn.feature.managedevices.api" }

dependencies { implementation(projects.lib.model) }
