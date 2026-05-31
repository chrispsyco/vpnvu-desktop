package vu.vpn.feature.login.api

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult

@Parcelize data class ApiUnreachableNavKey(val action: LoginAction) : NavKey2

@Parcelize
enum class LoginAction : Parcelable {
    LOGIN,
    CREATE_ACCOUNT,
}

@Parcelize
sealed interface ApiUnreachableInfoDialogResult : NavResult {
    data class Success(val arg: ApiUnreachableNavKey) : ApiUnreachableInfoDialogResult

    data object Error : ApiUnreachableInfoDialogResult
}
