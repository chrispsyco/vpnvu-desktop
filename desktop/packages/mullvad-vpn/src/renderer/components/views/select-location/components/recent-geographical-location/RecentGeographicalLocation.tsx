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
// The clock badge replaces the country flag since recent items can be a
// city or relay, not just a country.
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

const StyledClockBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  margin-right: 8px;
  border-radius: 8px;
  background: rgba(91, 200, 218, 0.08);
  border: 1px solid rgba(91, 200, 218, 0.18);
  color: rgb(121, 200, 211);
  flex-shrink: 0;

  svg {
    width: 13px;
    height: 13px;
  }
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
  const breadcrumbsSubLabel = locationBreadcrumbs.join(', ');

  const disabled = location.disabled || disabledProp;

  const showParents = location.type !== 'country';

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
                  location: location.label,
                },
              )}>
              <Location.Accordion.Header.Item>
                <StyledClockBadge aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 16 14" />
                  </svg>
                </StyledClockBadge>
                <FlexColumn>
                  <StyledTitleWithPing>
                    <Location.Accordion.Header.Item.Title>
                      {location.label}
                    </Location.Accordion.Header.Item.Title>
                    <PingBadge location={location} />
                  </StyledTitleWithPing>
                  {showParents && (
                    <FootnoteMiniSemiBold color="whiteAlpha60">
                      {breadcrumbsSubLabel}
                    </FootnoteMiniSemiBold>
                  )}
                </FlexColumn>
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
