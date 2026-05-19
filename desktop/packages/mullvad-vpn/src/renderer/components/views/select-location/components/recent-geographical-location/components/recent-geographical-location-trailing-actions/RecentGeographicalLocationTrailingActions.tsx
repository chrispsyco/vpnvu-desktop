import React from 'react';

import type { GeographicalLocation } from '../../../../../../../features/locations/types';

export type RecentGeographicalLocationTrailingActionProps = React.PropsWithChildren<{
  location: GeographicalLocation;
}>;

/**
 * Trailing actions for a "recent location" row.
 *
 * VPN.vu v1 strips the 3-dots kebab menu (its only entry today is
 * add-to-custom-list, and custom lists are hidden from the picker). The row
 * is just label + ping + selected-check now — no trailing controls.
 *
 * To re-enable: re-import `GeographicalLocationMenu` /
 * `GeographicalLocationMenuButton` and wrap them in
 * `<Location.Accordion.Header.TrailingActions>` as before.
 */
export function RecentGeographicalLocationTrailingActions(
  _props: RecentGeographicalLocationTrailingActionProps,
): React.JSX.Element | null {
  return null;
}
