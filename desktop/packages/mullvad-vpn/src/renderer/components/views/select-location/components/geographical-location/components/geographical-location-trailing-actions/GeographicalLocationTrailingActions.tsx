import React from 'react';
import { sprintf } from 'sprintf-js';

import { messages } from '../../../../../../../../shared/gettext';
import { type GeographicalLocation } from '../../../../../../../features/locations/types';
import { useAccordionContext } from '../../../../../../../lib/components/accordion/AccordionContext';
import { Location } from '../../../location-list-item';

export type GeographicalLocationTrailingActionsProps = React.PropsWithChildren<{
  location: GeographicalLocation;
}>;

/**
 * Trailing actions for a country/city row.
 *
 * VPN.vu v1 keeps this minimal on purpose:
 *  - The 3-dots kebab menu (`GeographicalLocationMenuButton` / `Menu`) is
 *    REMOVED — its only entries today (add-to-custom-list, etc) live behind
 *    Custom Lists, which we hide from the picker (see LocationLists.tsx).
 *  - The accordion chevron only renders for COUNTRY rows. Cities don't expand
 *    because we collapse the third level (relays) — see GeographicalLocation.
 *
 * To re-enable the menu: re-import `GeographicalLocationMenu` +
 * `GeographicalLocationMenuButton` and put them back as the first Action.
 */
export function GeographicalLocationTrailingActions({
  location,
}: GeographicalLocationTrailingActionsProps) {
  const { expanded } = useAccordionContext();

  const showAccordionTrigger = location.type === 'country';

  if (!showAccordionTrigger) {
    return null;
  }

  return (
    <Location.Accordion.Header.TrailingActions>
      <Location.Accordion.Header.AccordionTrigger
        aria-label={sprintf(
          expanded
            ? messages.pgettext('accessibility', 'Collapse %(location)s')
            : messages.pgettext('accessibility', 'Expand %(location)s'),
          { location: location.label },
        )}>
        <Location.Accordion.Header.TrailingActions.Action>
          <Location.Accordion.Header.TrailingActions.Action.Chevron />
        </Location.Accordion.Header.TrailingActions.Action>
      </Location.Accordion.Header.AccordionTrigger>
    </Location.Accordion.Header.TrailingActions>
  );
}
