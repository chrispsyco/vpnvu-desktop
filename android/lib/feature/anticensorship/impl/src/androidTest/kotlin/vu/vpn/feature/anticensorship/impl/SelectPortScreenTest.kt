package vu.vpn.feature.anticensorship.impl

import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import de.mannodermaus.junit5.compose.ComposeContext
import io.mockk.coVerify
import io.mockk.mockk
import vu.vpn.feature.anticensorship.impl.selectport.SelectPortScreen
import vu.vpn.feature.anticensorship.impl.selectport.SelectPortUiState
import vu.vpn.lib.common.Lc
import vu.vpn.lib.common.toLc
import vu.vpn.lib.model.Constraint
import vu.vpn.lib.model.Port
import vu.vpn.lib.model.PortType
import vu.vpn.screen.test.createEdgeToEdgeComposeExtension
import vu.vpn.screen.test.setContentWithTheme
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.RegisterExtension

@OptIn(ExperimentalTestApi::class)
class SelectPortScreenTest {
    @JvmField @RegisterExtension val composeExtension = createEdgeToEdgeComposeExtension()

    private fun ComposeContext.initScreen(
        state: Lc<Unit, SelectPortUiState>,
        onObfuscationPortSelected: (Constraint<Port>) -> Unit = {},
        navigateToCustomPortDialog: (Port?) -> Unit = {},
        onBackClick: () -> Unit = {},
    ) {
        setContentWithTheme {
            SelectPortScreen(
                state = state,
                onObfuscationPortSelected = onObfuscationPortSelected,
                navigateToCustomPortDialog = navigateToCustomPortDialog,
                onBackClick = onBackClick,
            )
        }
    }

    @Test
    fun testSelectPresetAndCustomPort() = composeExtension.use {
        // Arrange
        val onObfuscationPortSelected: (Constraint<Port>) -> Unit = mockk(relaxed = true)
        val navigateToCustomPortDialog: (Port?) -> Unit = mockk(relaxed = true)

        initScreen(
            state =
                SelectPortUiState(
                        port = Constraint.Any,
                        portType = PortType.Wireguard,
                        customPortEnabled = true,
                        presetPorts = listOf(Port(5555), Port(5556), Port(5557)),
                        title = "WireGuard port",
                    )
                    .toLc(),
            onObfuscationPortSelected = onObfuscationPortSelected,
            navigateToCustomPortDialog = navigateToCustomPortDialog,
        )

        // Act
        onNodeWithText("5555").assertExists().performClick()

        onNodeWithText("Custom").assertExists().performClick()

        // Assert
        coVerify(exactly = 1) { onObfuscationPortSelected.invoke(Constraint.Only(Port(5555))) }

        coVerify(exactly = 1) { navigateToCustomPortDialog.invoke(null) }
    }
}
