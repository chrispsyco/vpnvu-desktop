import { sprintf } from 'sprintf-js';

import { strings } from '../../../../../../shared/constants';
import { messages } from '../../../../../../shared/gettext';
import { FilterChip, type FilterChipProps } from '../../../../../lib/components';
import { FilterChipShell } from '../filter-chips/StyledFilterChipShell';

export type LwoFilterChipProps = FilterChipProps;

// LWO obfuscation indicator · passive (no clear). Cyan pill repaint provided
// by FilterChipShell wrapping the lib FilterChip rendered as a <div>.
export function LwoFilterChip(props: LwoFilterChipProps) {
  return (
    <FilterChipShell>
      <FilterChip as="div" {...props}>
        <FilterChip.Text>
          {sprintf(
            // TRANSLATORS: Label for indicator that shows that obfuscation is being used as a filter.
            // TRANSLATORS: Available placeholders:
            // TRANSLATORS: %(obfuscation)s - type of obfuscation in use
            messages.pgettext('select-location-view', 'Obfuscation: %(obfuscation)s'),
            { obfuscation: strings.lwo },
          )}
        </FilterChip.Text>
      </FilterChip>
    </FilterChipShell>
  );
}
