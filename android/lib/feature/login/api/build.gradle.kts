plugins { alias(libs.plugins.mullvad.android.library.feature.api) }

android { namespace = "vu.vpn.feature.login.api" }

dependencies { api(projects.lib.model) }
