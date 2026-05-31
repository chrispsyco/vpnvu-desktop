package vu.vpn.feature.location.api

import kotlinx.parcelize.Parcelize
import vu.vpn.core.NavKey2
import vu.vpn.core.NavResult
import vu.vpn.lib.model.MultihopRelayListType

// PSYCO · initialHop pré-seleciona entry/exit quando aberto pela seção
// "Servidores" do Multihop. null = comportamento padrão (default EXIT).
@Parcelize
data class SelectLocationNavKey(val initialHop: MultihopRelayListType? = null) : NavKey2

@Parcelize data class SelectLocationNavResult(val connect: Boolean) : NavResult
