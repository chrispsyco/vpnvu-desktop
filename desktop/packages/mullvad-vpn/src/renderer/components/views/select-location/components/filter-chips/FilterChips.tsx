import styled from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import { useActiveFilters } from '../../../../../features/locations/hooks/use-active-filters';
import { geistMono } from '../../../../common-styles';
import { useSelectLocationViewContext } from '../../SelectLocationViewContext';
import { DaitaFilterChip } from '../daita-filter-chip';
import { LwoFilterChip } from '../lwo-filter-chip';
import { OwnershipFilterChip } from '../ownership-filter-chip';
import { ProvidersFilterChip } from '../providers-filter-chip';
import { QuicFilterChip } from '../quic-filter-chip';

// -----------------------------------------------------------------------------
// FilterChips · horizontal row of active filter pills (DAITA / Obfuscation /
// Ownership / Providers / QUIC).
//
// VPN.vu treatment: the row gets a subtle cyan-tinted card-like surface so
// the chips read as a grouped filter context (figma frame 2 · "Expanded ·
// Filters"), with a "FILTRADO" mono kicker pinned to the left. We swap the
// shared <Flex>/<LabelTinySemiBold> for a styled wrapper so we can tighten
// the layout and apply the Geist Mono typography that matches the rest of
// the kit (the lib LabelTinySemiBold ships Open Sans by default).
// -----------------------------------------------------------------------------

export function FilterChips() {
  const { locationType } = useSelectLocationViewContext();
  const {
    isOwnershipFilterActive,
    isProvidersFilterActive,
    isDaitaFilterActive,
    isLwoFilterActive,
    isQuicFilterActive,
  } = useActiveFilters(locationType);

  return (
    <StyledRow>
      <StyledKicker>{messages.pgettext('select-location-view', 'Filtered:')}</StyledKicker>

      <StyledChips>
        {isOwnershipFilterActive && <OwnershipFilterChip />}
        {isProvidersFilterActive && <ProvidersFilterChip />}
        {isDaitaFilterActive && <DaitaFilterChip />}
        {isQuicFilterActive && <QuicFilterChip />}
        {isLwoFilterActive && <LwoFilterChip />}
      </StyledChips>
    </StyledRow>
  );
}

// Outer pill that anchors the kicker + chip cluster. The border-radius is
// generous (16px) so the row reads as a filter "card", not just floating
// chips. Padding is asymmetric (6px top/bottom, 12px sides) to keep the row
// height aligned with the search field below.
const StyledRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 8px 12px;
  padding: 8px 12px;
  border-radius: 16px;
  background: rgba(10, 33, 40, 0.7);
  border: 1px solid rgba(91, 200, 218, 0.16);
  box-shadow: 0 8px 24px -18px rgba(0, 0, 0, 0.5);
  flex-wrap: wrap;
`;

const StyledKicker = styled.span`
  font-family: ${geistMono};
  font-size: 10px;
  font-weight: 600;
  line-height: 14px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #5bc8da;
  flex-shrink: 0;
`;

const StyledChips = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
  flex: 1;
  min-width: 0;
`;
