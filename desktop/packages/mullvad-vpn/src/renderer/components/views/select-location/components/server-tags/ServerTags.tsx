import styled from 'styled-components';

import { type GeographicalLocation } from '../../../../../features/locations/types';
import { useVpnvuServers } from '../../../../../lib/globe/vpnvu-servers';

// -----------------------------------------------------------------------------
// ServerTags · product badges (STREAMING / PRIVACY) rendered inline next to a
// location's name in the select-location picker, right after the PingBadge.
//
// Source of truth is the live `/v1/servers` feed (via useVpnvuServers), so
// retagging a relay in the Neon DB reflects here with NO app rebuild — same
// data path the globe pins already use. We match a picker row to its tags by
// COUNTRY CODE (the v1 picker is one city per country, so the country row and
// its single city share the same tag set); when a country ever holds multiple
// tagged cities, the row shows the UNION of their tags.
//
// Visual: outline pill, Geist Mono, uppercase, tiny — STREAMING in lava red,
// PRIVACY in brand cyan (#5BC8DA). Matches the FilterChip/Ping pill language.
// -----------------------------------------------------------------------------

type TagStyle = { fg: string; border: string; bg: string };

// fg is nudged a touch lighter than the pure brand hue so the small uppercase
// glyphs stay legible on the dark picker background.
const TAG_STYLES: Record<string, TagStyle> = {
  STREAMING: { fg: '#FF8C80', border: 'rgba(255, 107, 91, 0.55)', bg: 'rgba(255, 107, 91, 0.08)' },
  PRIVACY: { fg: '#7FD6E4', border: 'rgba(91, 200, 218, 0.55)', bg: 'rgba(91, 200, 218, 0.08)' },
};

const FALLBACK_STYLE: TagStyle = {
  fg: 'rgb(176, 184, 188)',
  border: 'rgba(176, 184, 188, 0.4)',
  bg: 'rgba(255, 255, 255, 0.04)',
};

function styleFor(tag: string): TagStyle {
  return TAG_STYLES[tag.toUpperCase()] ?? FALLBACK_STYLE;
}

export function ServerTags({ location }: { location: GeographicalLocation }) {
  const servers = useVpnvuServers();

  // All daemon location detail types carry a `country` code; match on it.
  const countryCode = location.details.country?.toLowerCase();
  if (!countryCode) return null;

  // Union of tags across every server in this country (normally one, given the
  // one-city-per-country picker), de-duped while preserving first-seen order.
  const tags = Array.from(
    new Set(
      servers
        .filter((server) => server.countryCode.toLowerCase() === countryCode)
        .flatMap((server) => server.tags),
    ),
  );

  if (tags.length === 0) return null;

  return (
    <StyledTagRow aria-hidden="true">
      {tags.map((tag) => {
        const tone = styleFor(tag);
        return (
          <StyledTag key={tag} $fg={tone.fg} $border={tone.border} $bg={tone.bg}>
            {tag}
          </StyledTag>
        );
      })}
    </StyledTagRow>
  );
}

const StyledTagRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const StyledTag = styled.span<{ $fg: string; $border: string; $bg: string }>`
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', monospace;
  font-size: 7.5px;
  font-weight: 600;
  letter-spacing: 0.05em;
  line-height: 1;
  text-transform: uppercase;
  color: ${({ $fg }) => $fg};
  border: 1px solid ${({ $border }) => $border};
  background: ${({ $bg }) => $bg};
  border-radius: 999px;
  padding: 2px 5px;
  white-space: nowrap;
  pointer-events: none;
`;
