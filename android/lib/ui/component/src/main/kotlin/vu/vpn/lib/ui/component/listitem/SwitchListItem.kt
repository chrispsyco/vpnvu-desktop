package vu.vpn.lib.ui.component.listitem

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.focusProperties
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import vu.vpn.lib.ui.component.R
import vu.vpn.lib.ui.designsystem.Hierarchy
import vu.vpn.lib.ui.designsystem.MullvadListItem
import vu.vpn.lib.ui.designsystem.MullvadSwitch
import vu.vpn.lib.ui.designsystem.Position
import vu.vpn.lib.ui.theme.AppTheme
import vu.vpn.lib.ui.theme.Dimens
import vu.vpn.lib.ui.util.applyIfNotNull

@Preview
@Composable
private fun PreviewSwitchListItem() {
    AppTheme {
        SwitchListItem(
            title = "Checkbox Title",
            isEnabled = true,
            isToggled = true,
            onCellClicked = {},
            onInfoClicked = {},
        )
    }
}

@Composable
fun SwitchListItem(
    modifier: Modifier = Modifier,
    hierarchy: Hierarchy = Hierarchy.Parent,
    position: Position = Position.Single,
    title: String,
    subtitle: String? = null,
    isToggled: Boolean,
    isEnabled: Boolean = true,
    singeLine: Boolean = true,
    testTag: String? = null,
    backgroundAlpha: Float = 1f,
    onCellClicked: (Boolean) -> Unit,
    onInfoClicked: (() -> Unit)? = null,
) {
    MullvadListItem(
        modifier = modifier.applyIfNotNull(onInfoClicked) { focusProperties { canFocus = false } },
        hierarchy = hierarchy,
        position = position,
        isEnabled = isEnabled,
        testTag = testTag,
        backgroundAlpha = backgroundAlpha,
        onClick = { onCellClicked(!isToggled) },
        content = {
            if (subtitle == null) {
                Text(
                    text = title,
                    maxLines = if (singeLine) 1 else Int.MAX_VALUE,
                    overflow = TextOverflow.Ellipsis,
                )
            } else {
                // PSYCO · title + subtitle (estilo Figma DNS blockers) · subtitle
                // descritivo em bodySmall muted abaixo do título.
                Column {
                    Text(
                        text = title,
                        maxLines = if (singeLine) 1 else Int.MAX_VALUE,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
        },
        trailingContent = {
            Row(
                modifier = Modifier.fillMaxHeight(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (onInfoClicked != null) {
                    Box(
                        modifier =
                            Modifier.width(ListItemComponentTokens.infoIconContainerWidth)
                                .fillMaxHeight(),
                        contentAlignment = Alignment.Center,
                    ) {
                        IconButton(onClick = onInfoClicked) {
                            Icon(
                                imageVector = Icons.Rounded.Info,
                                contentDescription = stringResource(id = R.string.more_information),
                            )
                        }
                    }
                }

                Box(modifier = Modifier.fillMaxHeight().padding(end = Dimens.smallPadding)) {
                    MullvadSwitch(
                        modifier = Modifier.align(Alignment.Center),
                        checked = isToggled,
                        onCheckedChange = onCellClicked,
                        enabled = isEnabled,
                    )
                }
            }
        },
    )
}
