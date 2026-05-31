package vu.vpn.lib.ui.component.listitem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import vu.vpn.lib.ui.component.R
import vu.vpn.lib.ui.component.preview.PreviewColumn
import vu.vpn.lib.ui.designsystem.MullvadCircularProgressIndicatorSmall
import vu.vpn.lib.ui.designsystem.MullvadListItem
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.theme.color.positive

@Preview
@Composable
private fun PreviewServerIpOverridesListItem() {
    PreviewColumn {
        ServerIpOverridesListItem(active = true)
        ServerIpOverridesListItem(active = false)
        ServerIpOverridesListItem(active = null)
    }
}

@Composable
fun ServerIpOverridesListItem(
    active: Boolean?,
    modifier: Modifier = Modifier,
    singleLine: Boolean = true,
    activeColor: Color = MaterialTheme.colorScheme.positive,
    inactiveColor: Color = MaterialTheme.colorScheme.error,
) {
    MullvadListItem(
        modifier = modifier,
        isEnabled = active == true,
        leadingContent = {
            if (active == null) {
                MullvadCircularProgressIndicatorSmall()
            } else {
                Box(
                    modifier =
                        Modifier.size(Dimens.relayCircleSize)
                            .background(
                                color =
                                    when {
                                        active -> activeColor
                                        else -> inactiveColor
                                    },
                                shape = CircleShape,
                            )
                )
            }
        },
        content = {
            if (active != null) {
                Text(
                    text =
                        if (active) stringResource(id = R.string.server_ip_overrides_active)
                        else stringResource(id = R.string.server_ip_overrides_inactive),
                    maxLines = if (singleLine) 1 else Int.MAX_VALUE,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(horizontal = Dimens.smallPadding),
                )
            }
        },
    )
}
