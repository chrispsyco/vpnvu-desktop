import styled from 'styled-components';

import type { GeographicalLocation } from '../../../../../features/locations/types';
import {
  StyledListItemItem,
  StyledListItemTrigger,
} from '../../../../../lib/components/list-item/components';
import { StyledListItemTrailingAction } from '../../../../../lib/components/list-item/components/list-item-trailing-actions/components';
import { spacings } from '../../../../../lib/foundations';
import { GeographicalLocation as GeographicalLocationComponent } from '../geographical-location';
import { useLocationListsContext } from '../location-lists/LocationListsContext';

// VPN.vu · root country card. Each country sits inside a surface-tinted card
// with a hairline border so the list reads as a stack of discrete tiles —
// Figma reference: `.frame-grid--vpnvu` rows on `02-select-location-screen.html`.
// The descendant overrides re-skin the underlying generic `ListItem`/`Accordion`
// primitives (which paint themselves with the legacy Mullvad blue palette) to
// match the VPN.vu palette without touching the shared lib primitives.
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

  /* Strip the legacy blue Mullvad rectangle background from the primitive
     row cells and let the parent card paint the surface. */
  ${StyledListItemItem} {
    background-color: transparent;
    border-radius: 0;
  }

  ${StyledListItemTrailingAction} {
    background-color: transparent;
    border-radius: 0;
  }

  /* Cyan-alpha hover tint matching the Figma .sl-row:hover rule. */
  ${StyledListItemTrigger}:hover ${StyledListItemItem} {
    background-color: rgba(91, 200, 218, 0.06);
  }
  ${StyledListItemTrigger}:hover ${StyledListItemTrailingAction} {
    background-color: rgba(91, 200, 218, 0.06);
  }
`;

export type CountryLocationProps = {
  location: GeographicalLocation;
};

export function CountryLocation({ location }: CountryLocationProps) {
  const { handleSelect } = useLocationListsContext();

  return (
    <StyledLocationContainer $selected={Boolean(location.selected)}>
      <GeographicalLocationComponent root location={location} level={0} onSelect={handleSelect} />
    </StyledLocationContainer>
  );
}
