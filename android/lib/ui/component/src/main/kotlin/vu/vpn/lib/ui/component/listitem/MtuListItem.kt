package vu.vpn.lib.ui.component.listitem

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import vu.vpn.lib.model.Mtu
import vu.vpn.lib.ui.component.R
import vu.vpn.lib.ui.designsystem.Hierarchy
import vu.vpn.lib.ui.designsystem.MullvadListItem
import vu.vpn.lib.ui.designsystem.Position
import vu.vpn.lib.ui.theme.AppTheme

@Preview
@Composable
private fun PreviewMtuListView() {
    AppTheme { MtuListItem(mtuValue = Mtu(55555), onEditMtu = {}) }
}

@Composable
fun MtuListItem(
    modifier: Modifier = Modifier,
    hierarchy: Hierarchy = Hierarchy.Parent,
    position: Position = Position.Single,
    mtuValue: Mtu?,
    singeLine: Boolean = true,
    onEditMtu: () -> Unit,
    backgroundAlpha: Float = 1f,
) {
    MullvadListItem(
        modifier = modifier,
        hierarchy = hierarchy,
        position = position,
        onClick = onEditMtu,
        backgroundAlpha = backgroundAlpha,
        content = {
            TitleAndSubtitle(
                title = stringResource(R.string.mtu),
                subtitle =
                    stringResource(
                        id = R.string.mtu_x,
                        mtuValue?.value?.toString() ?: stringResource(id = R.string.hint_default),
                    ),
                singleLine = singeLine,
            )
        },
        trailingContent = { Icon(imageVector = Icons.Rounded.Edit, contentDescription = null) },
    )
}
