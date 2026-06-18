import React from 'react';
import { sprintf } from 'sprintf-js';

import { messages } from '../../../../../../../../shared/gettext';
import { type GeographicalLocation } from '../../../../../../../features/locations/types';
import { useAccordionContext } from '../../../../../../../lib/components/accordion/AccordionContext';
import { Location } from '../../../location-list-item';

export type GeographicalLocationTrailingActionsProps = React.PropsWithChildren<{
  location: GeographicalLocation;
  /** Whether this row has servers nested under it (drives the arrow direction). */
  hasChildren: boolean;
}>;

/**
 * Trailing arrow for a country/city/server row.
 *
 * VPN.vu shows an arrow on EVERY row, at every level:
 *  - A row that HAS servers under it (country, or a city with relays) shows a
 *    down arrow (↓) and is clickable to expand/collapse those servers.
 *  - A leaf row (a final server with nothing under it) shows a right arrow (→)
 *    that's purely indicative — no expand trigger.
 * The arrow reflects "has servers below or not", so it stays fixed when the row
 * is expanded (it is not a tree open/closed indicator).
 *
 * The 3-dots kebab menu is intentionally removed (its entries live behind Custom
 * Lists, which the picker hides). To re-enable it, re-import
 * `GeographicalLocationMenu`/`GeographicalLocationMenuButton` as the first Action.
 */
export function GeographicalLocationTrailingActions({
  location,
  hasChildren,
}: GeographicalLocationTrailingActionsProps) {
  const { expanded } = useAccordionContext();

  // Leaf (final server): a right arrow with no expand trigger.
  if (!hasChildren) {
    return (
      <Location.Accordion.Header.TrailingActions>
        <Location.Accordion.Header.TrailingActions.Action>
          <Location.Accordion.Header.TrailingActions.Action.Chevron icon="chevron-right" />
        </Location.Accordion.Header.TrailingActions.Action>
      </Location.Accordion.Header.TrailingActions>
    );
  }

  // Has servers below: a fixed down arrow that expands/collapses on click.
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
          <Location.Accordion.Header.TrailingActions.Action.Chevron icon="chevron-down" />
        </Location.Accordion.Header.TrailingActions.Action>
      </Location.Accordion.Header.AccordionTrigger>
    </Location.Accordion.Header.TrailingActions>
  );
}
