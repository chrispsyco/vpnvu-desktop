import { useCallback, useEffect, useState } from 'react';
import { sprintf } from 'sprintf-js';
import styled from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import { useRecents } from '../../../../../features/locations/hooks';
import { type GeographicalLocation } from '../../../../../features/locations/types';
import { getLocationChildren } from '../../../../../features/locations/utils';
import { type ListItemProps } from '../../../../../lib/components/list-item';
import { useScrollPositionContext } from '../../ScrollPositionContext';
import { getLocationListItemMapProps } from '../../utils';
import { Location } from '../location-list-item';
import { PingBadge } from '../ping-badge';
import { ServerTags } from '../server-tags';
import { GeographicalLocationTrailingActions } from './components';
import {
  GeographicalLocationProvider,
  useGeographicalLocationContext,
} from './GeographicalLocationContext';

// Wraps the entire LEFT side of the row (flag + title + ping) so the
// underlying Header.Item's `justify-content: space-between` keeps the trailing
// chevron/count on the right while the flag/title/ping stay shoulder-to-
// shoulder on the left.
//
// Chris caught (2026-05-19) that the previous structure rendered flag and
// title+ping as two separate children of the space-between flexbox, which
// pushed them to opposite edges with a giant gap in between. The new cluster
// keeps everything ONE flex line on the left so the country name sits "bem ao
// lado da caixa" as in the Figma `.sl-row` reference.
const StyledLeftCluster = styled.span`
  display: inline-flex;
  align-items: center;
  min-width: 0;
  flex-shrink: 1;
  gap: 10px;
`;

const StyledTitleWithPing = styled.span`
  display: inline-flex;
  align-items: center;
  min-width: 0;
  flex-shrink: 1;
  gap: 9px;
`;

// Bloco meta à direita do nome · 2 linhas empilhadas: TAGS em cima, PING embaixo.
// align-items:center no StyledTitleWithPing centraliza este stack com o nome de
// 1 linha, mantendo a altura do card quase igual à de antes.
const StyledMetaStack = styled.span`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  flex-shrink: 0;
`;

// VPN.vu · 2-letter country flag pill rendered on the left of root country
// rows. Mirrors the Figma `.sl-row__flag` token: tight 22x22 tile so the
// 2-letter code reads CENTERED inside the cyan background (the previous
// 26x26 looked oversized for the "DE"/"BR" glyph and felt offset).
const StyledFlagPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: rgba(91, 200, 218, 0.12);
  border: 1px solid rgba(91, 200, 218, 0.25);
  color: rgb(121, 200, 211);
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  flex-shrink: 0;
  line-height: 1;
`;

export type GeographicalLocationProps = Pick<ListItemProps, 'level' | 'position'> & {
  location: GeographicalLocation;
  root?: boolean;
  disabled?: boolean;
  onSelect: (location: GeographicalLocation) => void;
  expanded?: boolean;
};

function GeographicalLocationImpl({
  location,
  level,
  disabled: disabledProp,
  root,
  position,
  onSelect,
  ...props
}: GeographicalLocationProps) {
  const { loading } = useGeographicalLocationContext();
  const [expanded, setExpanded] = useState(location.expanded);
  // VPN.vu v1 picker only renders TWO levels of hierarchy: country → city
  // (where each city == "1 servidor por estado"). The Mullvad tree exposes a
  // third level (city → relays) which we hide here — Chris asked to keep the
  // tree shallow until the daemon ships our own relay topology. To re-enable
  // 3-level depth, drop the `location.type === 'city' ? [] : …` short-circuit.
  const locationChildren = location.type === 'city' ? [] : getLocationChildren(location);
  const { selectedLocationRef } = useScrollPositionContext();
  const { hasRecents } = useRecents();

  useEffect(() => {
    setExpanded(location.expanded);
  }, [location.expanded]);

  const disabled = disabledProp || location.disabled || loading;
  const showChildren = locationChildren.length > 0 && expanded;

  // PSYCO · país com EXATAMENTE 1 cidade mostra "País · Cidade" inline no título
  // (ex.: "Brasil · São Paulo") em vez de só "Brasil" exigindo expand.
  const displayLabel =
    location.type === 'country' && locationChildren.length === 1
      ? `${location.label} · ${locationChildren[0].label}`
      : location.label;

  const handleClick = useCallback(() => {
    onSelect(location);
  }, [location, onSelect]);

  const handleSelect = useCallback(
    (location: GeographicalLocation) => {
      onSelect(location);
    },
    [onSelect],
  );

  const renderChildren = () => {
    return locationChildren.map((locationChild) => {
      const { key, nextLevel } = getLocationListItemMapProps(locationChild, level);
      return (
        <GeographicalLocation
          key={key}
          location={locationChild}
          level={nextLevel}
          disabled={disabled}
          onSelect={handleSelect}
          {...props}
        />
      );
    });
  };

  // Only scroll to the selected location when the recents feature is disabled
  const shouldScrollToLocation = location.selected && !hasRecents;
  const refToScrollTo = shouldScrollToLocation ? selectedLocationRef : null;

  return (
    <Location selected={location.selected} root={root}>
      <Location.Accordion expanded={expanded} onExpandedChange={setExpanded} disabled={disabled}>
        <Location.Accordion.Header ref={refToScrollTo} level={level} position={position}>
          <Location.Accordion.Header.ItemTrigger
            onClick={handleClick}
            aria-label={sprintf(
              // TRANSLATORS: Accessibility label for a button that connects to a location.
              // TRANSLATORS: Available placeholders:
              // TRANSLATORS: %(location)s - The name of the location that will be connected to when the button is clicked.
              messages.pgettext('accessibility', 'Connect to %(location)s'),
              {
                location: location.label,
              },
            )}>
            <Location.Accordion.Header.Item>
              <StyledLeftCluster>
                {root && location.type === 'country' && location.details.country && (
                  <StyledFlagPill aria-hidden="true">
                    {location.details.country.slice(0, 2)}
                  </StyledFlagPill>
                )}
                <StyledTitleWithPing>
                  <Location.Accordion.Header.Item.Title>
                    {displayLabel}
                  </Location.Accordion.Header.Item.Title>
                  <StyledMetaStack>
                    <ServerTags location={location} />
                    <PingBadge location={location} />
                  </StyledMetaStack>
                </StyledTitleWithPing>
              </StyledLeftCluster>
            </Location.Accordion.Header.Item>
          </Location.Accordion.Header.ItemTrigger>
          <GeographicalLocationTrailingActions location={location} />
        </Location.Accordion.Header>
        <Location.Accordion.Content>
          {showChildren ? renderChildren() : null}
        </Location.Accordion.Content>
      </Location.Accordion>
    </Location>
  );
}

export function GeographicalLocation({ ...props }: GeographicalLocationProps) {
  return (
    <GeographicalLocationProvider>
      <GeographicalLocationImpl {...props} />
    </GeographicalLocationProvider>
  );
}
