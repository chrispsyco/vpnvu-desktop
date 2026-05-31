package vu.vpn.feature.vpnsettings.impl

import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.IpVersion
import vu.vpn.lib.model.Mtu
import vu.vpn.lib.model.ObfuscationMode
import vu.vpn.lib.model.QuantumResistantState

data class VpnSettingsUiState(
    val settings: List<VpnSettingItem>,
    val isModal: Boolean,
    val obfuscationMode: ObfuscationMode,
) {

    companion object {
        @Suppress("LongParameterList", "CyclomaticComplexMethod", "LongMethod")
        fun from(
            mtu: Mtu?,
            isLocalNetworkSharingEnabled: Boolean,
            obfuscationMode: ObfuscationMode,
            quantumResistant: QuantumResistantState,
            systemVpnSettingsAvailable: Boolean,
            autoStartAndConnectOnBoot: Boolean,
            deviceIpVersion: Constraint<IpVersion>,
            isIpv6Enabled: Boolean,
            isModal: Boolean,
        ) =
            VpnSettingsUiState(
                buildList {
                    if (systemVpnSettingsAvailable) {
                        add(VpnSettingItem.AutoConnectAndLockdownMode)
                        add(VpnSettingItem.AutoConnectAndLockdownModeInfo)
                    } else {
                        add(VpnSettingItem.ConnectDeviceOnStartUpSetting(autoStartAndConnectOnBoot))
                        add(VpnSettingItem.Spacer)
                    }

                    // Local network sharing
                    add(VpnSettingItem.LocalNetworkSharingSetting(isLocalNetworkSharingEnabled))
                    add(VpnSettingItem.Spacer)

                    // Dns Settings item
                    add(VpnSettingItem.DnsHeader)
                    add(VpnSettingItem.Spacer)

                    // IPv6
                    add(VpnSettingItem.EnableIpv6Setting(isIpv6Enabled))

                    add(VpnSettingItem.Spacer)

                    // Anti-censorship
                    add(VpnSettingItem.AntiCensorshipHeader)

                    add(VpnSettingItem.Spacer)

                    // Quantum Resistance
                    add(
                        VpnSettingItem.QuantumResistantSetting(
                            quantumResistant == QuantumResistantState.On
                        )
                    )

                    add(VpnSettingItem.Spacer)

                    // Device Ip Version
                    add(VpnSettingItem.DeviceIpVersionHeader)

                    IpVersion.constraints.forEach {
                        add(VpnSettingItem.Divider)
                        add(VpnSettingItem.DeviceIpVersionItem(it, deviceIpVersion == it))
                    }

                    add(VpnSettingItem.Spacer)

                    // MTU
                    add(VpnSettingItem.Mtu(mtu))
                    add(VpnSettingItem.Spacer)

                    // Server IP override
                    add(VpnSettingItem.ServerIpOverrides)
                    add(VpnSettingItem.Spacer)
                },
                isModal = isModal,
                obfuscationMode = obfuscationMode,
            )
    }
}
