import { sprintf } from 'sprintf-js';

import { messages } from '../../../../../../shared/gettext';
import { FilterChip, type FilterChipProps } from '../../../../../lib/components';
import { FilterChipShell } from '../filter-chips/StyledFilterChipShell';

export type DaitaFilterChipProps = FilterChipProps;

// DAITA is a passive indicator (no clear handler) — render the lib FilterChip
// as a non-button <div> so it doesn't pick up focus rings or pointer cursor.
// The VPN.vu cyan-pill repaint lives in <FilterChipShell> as a parent wrapper.
export function DaitaFilterChip(props: DaitaFilterChipProps) {
  return (
    <FilterChipShell>
      <FilterChip as="div" {...props}>
        <FilterChip.Text>
          {sprintf(messages.pgettext('select-location-view', 'Setting: %(settingName)s'), {
            settingName: 'DAITA',
          })}
        </FilterChip.Text>
      </FilterChip>
    </FilterChipShell>
  );
}
