package vu.vpn.feature.apiaccess.impl

import vu.vpn.lib.model.ApiAccessMethod
import vu.vpn.lib.model.ApiAccessMethodId
import vu.vpn.lib.model.ApiAccessMethodName
import vu.vpn.lib.model.ApiAccessMethodSetting
import vu.vpn.lib.model.Cipher
import vu.vpn.lib.model.Port

private const val UUID1 = "12345678-1234-5678-1234-567812345678"
private const val UUID2 = "12345678-1234-5678-1234-567812345679"

val DIRECT_ACCESS_METHOD =
    ApiAccessMethodSetting(
        id = ApiAccessMethodId.fromString(UUID1),
        name = ApiAccessMethodName.fromString("Direct"),
        enabled = true,
        apiAccessMethod = ApiAccessMethod.Direct,
    )

val CUSTOM_ACCESS_METHOD =
    ApiAccessMethodSetting(
        id = ApiAccessMethodId.fromString(UUID2),
        name = ApiAccessMethodName.fromString("ShadowSocks"),
        enabled = true,
        apiAccessMethod =
            ApiAccessMethod.CustomProxy.Shadowsocks(
                ip = "1.1.1.1",
                port = Port(123),
                password = "Password",
                cipher = Cipher.RC4,
            ),
    )
