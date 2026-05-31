package vu.vpn.lib.repository

import java.net.InetAddress
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import vu.vpn.lib.grpc.ManagementService
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.CustomDnsOptions
import vu.vpn.lib.model.DefaultDnsOptions
import vu.vpn.lib.model.DnsOptions
import vu.vpn.lib.model.DnsState
import vu.vpn.lib.model.Mtu
import vu.vpn.lib.model.ObfuscationMode
import vu.vpn.lib.model.Port
import vu.vpn.lib.model.QuantumResistantState
import vu.vpn.lib.model.Settings

@Suppress("TooManyFunctions")
class SettingsRepository(
    private val managementService: ManagementService,
    dispatcher: CoroutineDispatcher = Dispatchers.IO,
) {
    val settingsUpdates: StateFlow<Settings?> =
        managementService.settings.stateIn(
            CoroutineScope(dispatcher),
            SharingStarted.WhileSubscribed(),
            null,
        )

    suspend fun setDnsOptions(
        state: DnsState,
        dnsList: List<InetAddress>,
        contentBlockersOptions: DefaultDnsOptions,
    ) =
        managementService.setDnsOptions(
            DnsOptions(
                state = state,
                customOptions = CustomDnsOptions(ArrayList(dnsList)),
                defaultOptions = contentBlockersOptions,
            )
        )

    suspend fun updateContentBlockers(update: (DefaultDnsOptions) -> DefaultDnsOptions) =
        managementService.updateDnsContentBlockers(update)

    suspend fun setDnsState(state: DnsState) = managementService.setDnsState(state)

    suspend fun deleteCustomDns(index: Int) = managementService.deleteCustomDns(index)

    suspend fun setCustomDns(index: Int, address: InetAddress) =
        managementService.setCustomDns(index, address)

    suspend fun addCustomDns(address: InetAddress) = managementService.addCustomDns(address)

    suspend fun setCustomWireguardPort(port: Constraint<Port>) =
        managementService.setWireguardObfuscationPort(port)

    suspend fun setCustomUdp2TcpObfuscationPort(constraint: Constraint<Port>) =
        managementService.setUdp2TcpObfuscationPort(constraint)

    suspend fun setCustomShadowsocksObfuscationPort(constraint: Constraint<Port>) =
        managementService.setShadowsocksObfuscationPort(constraint)

    suspend fun setCustomLwoObfuscationPort(constraint: Constraint<Port>) =
        managementService.setLwoObfuscationPort(constraint)

    suspend fun setWireguardMtu(mtu: Mtu) = managementService.setWireguardMtu(mtu.value)

    suspend fun resetWireguardMtu() = managementService.resetWireguardMtu()

    suspend fun setWireguardQuantumResistant(value: QuantumResistantState) =
        managementService.setWireguardQuantumResistant(value)

    suspend fun setObfuscation(value: ObfuscationMode) = managementService.setObfuscation(value)

    suspend fun setLocalNetworkSharing(isEnabled: Boolean) =
        managementService.setAllowLan(isEnabled)

    suspend fun setDaitaEnabled(enabled: Boolean) = managementService.setDaitaEnabled(enabled)

    suspend fun setDaitaDirectOnly(enabled: Boolean) = managementService.setDaitaDirectOnly(enabled)

    suspend fun setIpv6Enabled(enabled: Boolean) = managementService.setIpv6Enabled(enabled)

    suspend fun setRecentsEnabled(enabled: Boolean) = managementService.setRecentsEnabled(enabled)
}
