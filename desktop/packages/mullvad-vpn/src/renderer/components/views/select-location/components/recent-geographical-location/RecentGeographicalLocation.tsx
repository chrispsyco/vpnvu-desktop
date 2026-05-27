import { useCallback } from 'react';
import { sprintf } from 'sprintf-js';
import styled from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import type { GeographicalLocation } from '../../../../../features/locations/types';
import { FootnoteMiniSemiBold } from '../../../../../lib/components';
import { FlexColumn } from '../../../../../lib/components/flex-column';
import {
  StyledListItemItem,
  StyledListItemTrigger,
} from '../../../../../lib/components/list-item/components';
import { StyledListItemTrailingAction } from '../../../../../lib/components/list-item/components/list-item-trailing-actions/components';
import { spacings } from '../../../../../lib/foundations';
import { Location } from '../location-list-item';
import { useLocationListsContext } from '../location-lists/LocationListsContext';
import { PingBadge } from '../ping-badge';
import { RecentGeographicalLocationTrailingActions } from './components';
import { useLocationBreadcrumbs } from './hooks';
import { RecentGeographicalLocationProvider } from './RecentGeographicalLocationContext';

export type RecentGeographicalLocationProps = {
  location: GeographicalLocation;
  disabled?: boolean;
};

// VPN.vu · recent geographical card. Same surface as `CountryLocation` so the
// Recents section sits visually consistent with the All locations stack.
// The flag pill reuses GeographicalLocation's 22x22 country-code tile so
// recent rows visually align with the "Todas as localizações" list below
// instead of dropping a tiny clock glyph into the same slot.
const StyledLocationContainer = styled.div<{ $selected: boolean }>`
  position: relative;
  margin-bottom: ${spacings.tiny};
  background: ${({ $selected }) =>
    $selected ? 'rgba(9, 158, 180, 0.14)' : 'rgba(10, 33, 40, 0.7)'};
  border: 1px solid
    ${({ $selected }) => ($selected ? 'rgba(91, 200, 218, 0.45)' : 'rgba(91, 200, 218, 0.1)')};
  border-radius: 14px;
  overflow: hidden;
  transition:
    border-color 200ms ease,
    background-color 200ms ease,
    box-shadow 200ms ease;
  box-shadow: ${({ $selected }) => ($selected ? '0 0 24px rgba(9, 158, 180, 0.16)' : 'none')};

  &:hover {
    border-color: ${({ $selected }) =>
      $selected ? 'rgba(91, 200, 218, 0.55)' : 'rgba(91, 200, 218, 0.2)'};
  }

  ${StyledListItemItem} {
    background-color: transparent;
    border-radius: 0;
  }
  ${StyledListItemTrailingAction} {
    background-color: transparent;
    border-radius: 0;
  }
  ${StyledListItemTrigger}:hover ${StyledListItemItem} {
    background-color: rgba(91, 200, 218, 0.06);
  }
  ${StyledListItemTrigger}:hover ${StyledListItemTrailingAction} {
    background-color: rgba(91, 200, 218, 0.06);
  }
`;

// Mirror of GeographicalLocation's StyledFlagPill so recent rows render
// the same 2-letter country tile as the "Todas as localizações" list.
// Kept inline rather than extracted to a shared primitive because the two
// call sites are the only consumers — promote when a third appears.
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
  gap: 6px;
`;

function RecentGeographicalLocationImpl({
  location,
  disabled: disabledProp,
}: RecentGeographicalLocationProps) {
  const { handleSelect } = useLocationListsContext();

  const locationBreadcrumbs = useLocationBreadcrumbs(location);

  const disabled = location.disabled || disabledProp;

  // VPN.vu: when a country has a single city (current state of the network),
  // surface the city as the main label and the country as the sub-label so
  // Recents reads "São Paulo / Brasil" instead of a lonely "Brasil".
  const collapsedSingleCity =
    location.type === 'country' && location.cities.length === 1 ? location.cities[0] : null;

  const displayLabel = collapsedSingleCity ? collapsedSingleCity.label : location.label;
  const subLabel = collapsedSingleCity
    ? location.label
    : location.type !== 'country'
      ? locationBreadcrumbs.join(', ')
      : null;

  const handleClick = useCallback(() => {
    void handleSelect(location);
  }, [location, handleSelect]);

  return (
    <StyledLocationContainer $selected={Boolean(location.selected)}>
      <Location root selected={location.selected}>
        <Location.Accordion expanded disabled={disabled}>
          <Location.Accordion.Header level={0}>
            <Location.Accordion.Header.ItemTrigger
              onClick={handleClick}
              aria-label={sprintf(
                // TRANSLATORS: Accessibility label for a button that connects to a location.
                // TRANSLATORS: Available placeholders:
                // TRANSLATORS: %(location)s - The name of the location that will be connected to when the button is clicked.
                messages.pgettext('accessibility', 'Connect to %(location)s'),
                {
                  location: displayLabel,
                },
              )}>
              <Location.Accordion.Header.Item>
                <StyledLeftCluster>
                  {location.details.country && (
                    <StyledFlagPill aria-hidden="true">
                      {location.details.country.slice(0, 2)}
                    </StyledFlagPill>
                  )}
                  <FlexColumn>
                    <StyledTitleWithPing>
                      <Location.Accordion.Header.Item.Title>
                        {displayLabel}
                      </Location.Accordion.Header.Item.Title>
                      <PingBadge location={location} />
                    </StyledTitleWithPing>
                    {subLabel && (
                      <FootnoteMiniSemiBold color="whiteAlpha60">{subLabel}</FootnoteMiniSemiBold>
                    )}
                  </FlexColumn>
                </StyledLeftCluster>
              </Location.Accordion.Header.Item>
            </Location.Accordion.Header.ItemTrigger>
            <RecentGeographicalLocationTrailingActions location={location} />
          </Location.Accordion.Header>
        </Location.Accordion>
      </Location>
    </StyledLocationContainer>
  );
}

export function RecentGeographicalLocation({ ...props }: RecentGeographicalLocationProps) {
  return (
    <RecentGeographicalLocationProvider>
      <RecentGeographicalLocationImpl {...props} />
    </RecentGeographicalLocationProvider>
  );
}
