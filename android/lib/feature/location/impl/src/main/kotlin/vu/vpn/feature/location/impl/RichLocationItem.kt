package vu.vpn.feature.location.impl

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.KeyboardArrowDown
import androidx.compose.material.icons.rounded.KeyboardArrowUp
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import vu.vpn.lib.ui.theme.typeface.GeistMonoFontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import vu.vpn.lib.model.RelayLatency
import vu.vpn.lib.model.ServerTag
import vu.vpn.lib.ui.designsystem.Hierarchy
import vu.vpn.lib.ui.designsystem.Position

// VPN.vu accent + latency tones. Hardcoded (rather than pulled from the theme)
// so the picker matches the mockup exactly and mirrors the desktop PingBadge
// palette — the Mullvad base theme has no teal/cyan of its own.
private val VpnVuTeal = Color(0xFF5BC8DA)
private val PingGood = Color(0xFF44AD4D)
private val PingMid = Color(0xFFE8AC2E)
private val PingBad = Color(0xFFE34349)

// Product-tag tones (mirror the desktop ServerTags): streaming in lava red,
// privacy in the VPN.vu cyan.
private val TagStreaming = Color(0xFFE2502E)
private val TagPrivacy = VpnVuTeal

private fun pingTone(millis: Int): Color =
    when {
        millis < 50 -> PingGood
        millis < 150 -> PingMid
        else -> PingBad
    }

/** Circular 2-letter country tile, e.g. "BR". Stands in for a flag asset. */
@Composable
fun CountryCodeAvatar(code: String, modifier: Modifier = Modifier) {
    Box(
        modifier =
            modifier
                .size(34.dp)
                .clip(CircleShape)
                .background(VpnVuTeal.copy(alpha = 0.14f))
                .border(1.dp, VpnVuTeal.copy(alpha = 0.30f), CircleShape),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = code.uppercase().take(2),
            color = VpnVuTeal,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = GeistMonoFontFamily,
            letterSpacing = 0.5.sp,
        )
    }
}

/** Coloured RTT pill: a glowing dot plus "{ms}ms", tone driven by threshold. */
@Composable
fun LatencyPill(latency: RelayLatency, modifier: Modifier = Modifier) {
    val tone = pingTone(latency.millis)
    Row(
        modifier =
            modifier
                .clip(RoundedCornerShape(8.dp))
                .background(Color.White.copy(alpha = 0.05f))
                .padding(horizontal = 7.dp, vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(5.dp),
    ) {
        Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(tone))
        Text(
            text = "${latency.millis}ms",
            color = tone,
            fontSize = 10.sp,
            fontWeight = FontWeight.SemiBold,
            fontFamily = GeistMonoFontFamily,
        )
    }
}

/**
 * Compact product-tag chips for a location: STREAMING (lava red) and/or PRIVACY
 * (cyan), driven by the api.vpn.vu/v1/servers feed. Mirrors the desktop
 * ServerTags badges. Streaming leads because it's the differentiator (the whole
 * fleet is privacy-hardened).
 */
@Composable
fun ServerTagBadges(tags: Set<ServerTag>, modifier: Modifier = Modifier) {
    if (tags.isEmpty()) return
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(5.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (ServerTag.STREAMING in tags) ServerTagChip("STREAMING", TagStreaming)
        if (ServerTag.PRIVACY in tags) ServerTagChip("PRIVACY", TagPrivacy)
    }
}

@Composable
private fun ServerTagChip(label: String, tone: Color) {
    Text(
        text = label,
        color = tone,
        fontSize = 8.sp,
        fontWeight = FontWeight.SemiBold,
        fontFamily = GeistMonoFontFamily,
        letterSpacing = 0.6.sp,
        modifier =
            Modifier.clip(RoundedCornerShape(4.dp))
                .background(tone.copy(alpha = 0.12f))
                .border(1.dp, tone.copy(alpha = 0.34f), RoundedCornerShape(4.dp))
                .padding(horizontal = 5.dp, vertical = 2.dp),
    )
}

/**
 * A rich location row matching the redesign: country-code avatar, a green check
 * when selected, the name with an optional subtitle, the latency pill, and an
 * expand chevron when the item has children. Built standalone (not on
 * MullvadListItem) so the picker can own its look without disturbing the shared
 * list item used elsewhere.
 */
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun RichRelayRow(
    name: String,
    countryCode: String?,
    subtitle: String?,
    selected: Boolean,
    active: Boolean,
    canExpand: Boolean,
    expanded: Boolean,
    latency: RelayLatency?,
    tags: Set<ServerTag> = emptySet(),
    position: Position,
    hierarchy: Hierarchy,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    onLongClick: (() -> Unit)? = null,
    onToggleExpand: (Boolean) -> Unit = {},
) {
    val shape = position.toRowShape()
    val container =
        if (selected) VpnVuTeal.copy(alpha = 0.16f)
        else MaterialTheme.colorScheme.surfaceContainerHigh
    val nameColor =
        when {
            !active -> MaterialTheme.colorScheme.error
            selected -> PingGood
            else -> MaterialTheme.colorScheme.onSurface
        }

    Row(
        modifier =
            modifier
                .fillMaxWidth()
                .clip(shape)
                .background(container)
                .then(
                    if (selected) Modifier.border(1.dp, VpnVuTeal.copy(alpha = 0.40f), shape)
                    else Modifier
                )
                .combinedClickable(onClick = onClick, onLongClick = onLongClick)
                .padding(
                    start = 14.dp + hierarchy.indent(),
                    end = 12.dp,
                    top = 12.dp,
                    bottom = 12.dp,
                ),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        if (countryCode != null) {
            CountryCodeAvatar(countryCode)
        }
        if (selected) {
            Icon(
                imageVector = Icons.Rounded.Check,
                contentDescription = null,
                tint = nameColor,
                modifier = Modifier.size(18.dp),
            )
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = name,
                color = nameColor,
                fontWeight = FontWeight.Medium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            if (!subtitle.isNullOrBlank()) {
                Text(
                    text = subtitle,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            if (tags.isNotEmpty()) {
                ServerTagBadges(tags, modifier = Modifier.padding(top = 5.dp))
            }
        }
        if (latency != null) {
            LatencyPill(latency)
        }
        if (canExpand) {
            Icon(
                imageVector =
                    if (expanded) Icons.Rounded.KeyboardArrowUp
                    else Icons.Rounded.KeyboardArrowDown,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier =
                    Modifier.size(24.dp).clip(CircleShape).combinedClickable(
                        onClick = { onToggleExpand(!expanded) }
                    ),
            )
        }
    }
}

private fun Position.toRowShape(): RoundedCornerShape {
    val r = 16.dp
    return when (this) {
        Position.Single -> RoundedCornerShape(r)
        Position.Top -> RoundedCornerShape(topStart = r, topEnd = r)
        Position.Middle -> RoundedCornerShape(0.dp)
        Position.Bottom -> RoundedCornerShape(bottomStart = r, bottomEnd = r)
    }
}

private fun Hierarchy.indent() =
    when (this) {
        Hierarchy.Parent -> 0.dp
        Hierarchy.Child1 -> 16.dp
        Hierarchy.Child2 -> 32.dp
        Hierarchy.Child3 -> 48.dp
    }
