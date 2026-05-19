import { useCallback } from 'react';
import { sprintf } from 'sprintf-js';
import styled from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import type { CustomListLocation } from '../../../../../features/locations/types';
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
import { RecentCustomListTrailingActions } from './components';
import { RecentCustomListProvider } from './RecentCustomListLocationContext';

export type RecentCustomListLocationProps = {
  customList: CustomListLocation;
  disabled?: boolean;
};

// VPN.vu · recent custom list card. Mirrors `CustomListLocation` surface so
// the Recents section reads as a tighter version of the main list — same
// card, no expand chevron.
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

// Small clock glyph that anchors a recent row to its "history" semantics.
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

function RecentCustomListLocationImpl({
  customList,
  disabled: disabledProp,
}: RecentCustomListLocationProps) {
  const { handleSelect } = useLocationListsContext();

  const showEmptySubtitle = customList.locations.length === 0;
  const disabled = customList.disabled || disabledProp;

  const handleClick = useCallback(() => {
    void handleSelect(customList);
  }, [customList, handleSelect]);

  return (
    <StyledLocationContainer $selected={Boolean(customList.selected)}>
      <Location root selected={customList.selected}>
        <Location.ListItem disabled={disabled} level={0}>
          <Location.ListItem.Trigger
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
            <Location.ListItem.Item>
              <StyledClockBadge aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 16 14" />
                </svg>
              </StyledClockBadge>
              <FlexColumn>
                <Location.ListItem.Item.Label>{customList.label}</Location.ListItem.Item.Label>
                {showEmptySubtitle && (
                  <FootnoteMiniSemiBold color="whiteAlpha60">
                    {
                      // TRANSLATORS: Label for custom lists that don't have any locations added to them yet.
                      messages.pgettext('select-location-view', 'Empty')
                    }
                  </FootnoteMiniSemiBold>
                )}
              </FlexColumn>
            </Location.ListItem.Item>
          </Location.ListItem.Trigger>
          <RecentCustomListTrailingActions customList={customList} />
        </Location.ListItem>
      </Location>
    </StyledLocationContainer>
  );
}

export function RecentCustomListLocation({ ...props }: RecentCustomListLocationProps) {
  return (
    <RecentCustomListProvider>
      <RecentCustomListLocationImpl {...props} />
    </RecentCustomListProvider>
  );
}
