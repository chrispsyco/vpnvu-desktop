import { useCallback, useEffect, useState } from 'react';
import { sprintf } from 'sprintf-js';
import styled from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import { type CustomListLocation } from '../../../../../features/locations/types';
import { FootnoteMiniSemiBold } from '../../../../../lib/components';
import { AnimatedList } from '../../../../../lib/components/animated-list';
import { FlexColumn } from '../../../../../lib/components/flex-column';
import {
  StyledListItemItem,
  StyledListItemTrigger,
} from '../../../../../lib/components/list-item/components';
import { StyledListItemTrailingAction } from '../../../../../lib/components/list-item/components/list-item-trailing-actions/components';
import { spacings } from '../../../../../lib/foundations';
import { getLocationListItemMapProps } from '../../utils';
import { CustomListGeographicalLocation } from '../custom-list-geographical-location';
import { Location } from '../location-list-item';
import { useLocationListsContext } from '../location-lists/LocationListsContext';
import { CustomListTrailingActions } from './components';
import {
  CustomListLocationProvider,
  useCustomListLocationContext,
} from './CustomListLocationContext';

export type CustomListLocationProps = {
  customList: CustomListLocation;
  disabled?: boolean;
};

// VPN.vu · custom list card. Same surface treatment as a country root card
// (`CountryLocation`) so user-curated lists sit side-by-side with the
// geographic tree without a visual class break. Figma frame 4
// (`Custom list · Bottom sheet`) on `02-select-location-screen.html`.
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

// Bookmark glyph sitting in front of a custom list's name — a 26px cyan-tint
// pill that mirrors the country flag pill weight so the eye groups custom
// lists and geographic lists into the same row family.
const StyledBookmarkBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  margin-right: 8px;
  border-radius: 8px;
  background: rgba(91, 200, 218, 0.1);
  border: 1px solid rgba(91, 200, 218, 0.22);
  color: rgb(121, 200, 211);
  flex-shrink: 0;

  svg {
    width: 12px;
    height: 12px;
  }
`;

function CustomListLocationImpl({ customList, disabled: disabledProp }: CustomListLocationProps) {
  const [expanded, setExpanded] = useState(customList.expanded);
  const { handleSelect } = useLocationListsContext();
  const { loading } = useCustomListLocationContext();

  const showEmptySubtitle = customList.locations.length === 0;
  const disabled = customList.disabled || disabledProp || loading;

  // Collapse accordion when all its children are removed
  useEffect(() => {
    if (customList.locations.length === 0) {
      setExpanded(false);
    }
  }, [customList.locations.length, setExpanded]);

  // If custom list state is updated from outside, update state accordingly
  useEffect(() => {
    setExpanded(customList.expanded);
  }, [customList.expanded]);

  const handleClick = useCallback(() => {
    void handleSelect(customList);
  }, [customList, handleSelect]);

  const renderChildren = () => {
    return customList.locations.map((locationChild, index) => {
      const { key, nextLevel } = getLocationListItemMapProps(locationChild, 0);
      const position = index !== customList.locations.length - 1 ? 'middle' : undefined;

      return (
        <AnimatedList.Item key={key}>
          <CustomListGeographicalLocation
            position={position}
            location={locationChild}
            level={nextLevel}
            disabled={disabled}
          />
        </AnimatedList.Item>
      );
    });
  };

  return (
    <StyledLocationContainer $selected={Boolean(customList.selected)}>
      <Location root selected={customList.selected}>
        <Location.Accordion expanded={expanded} onExpandedChange={setExpanded} disabled={disabled}>
          <Location.Accordion.Header level={0}>
            <Location.Accordion.Header.ItemTrigger
              onClick={handleClick}
              aria-label={sprintf(
                // TRANSLATORS: Accessibility label for a button that connects to a location.
                // TRANSLATORS: Available placeholders:
                // TRANSLATORS: %(location)s - The name of the location that will be connected to when the button is clicked.
                messages.pgettext('accessibility', 'Connect to %(location)s'),
                {
                  location: customList.label,
                },
              )}>
              <Location.Accordion.Header.Item>
                <StyledBookmarkBadge aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </StyledBookmarkBadge>
                <FlexColumn>
                  <Location.Accordion.Header.Item.Title>
                    {customList.label}
                  </Location.Accordion.Header.Item.Title>
                  {showEmptySubtitle && (
                    <FootnoteMiniSemiBold color="whiteAlpha60">
                      {
                        // TRANSLATORS: Label for custom lists that don't have any locations added to them yet.
                        messages.pgettext('select-location-view', 'Empty')
                      }
                    </FootnoteMiniSemiBold>
                  )}
                </FlexColumn>
              </Location.Accordion.Header.Item>
            </Location.Accordion.Header.ItemTrigger>
            <CustomListTrailingActions customList={customList} />
          </Location.Accordion.Header>
          <Location.Accordion.Content>
            <AnimatedList>{expanded ? renderChildren() : null}</AnimatedList>
          </Location.Accordion.Content>
        </Location.Accordion>
      </Location>
    </StyledLocationContainer>
  );
}
export function CustomListLocation({ ...props }: CustomListLocationProps) {
  return (
    <CustomListLocationProvider>
      <CustomListLocationImpl {...props} />
    </CustomListLocationProvider>
  );
}
