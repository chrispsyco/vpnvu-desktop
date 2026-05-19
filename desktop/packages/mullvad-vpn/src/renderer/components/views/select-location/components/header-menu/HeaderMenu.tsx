import React from 'react';
import styled from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import { RoutePath } from '../../../../../../shared/routes';
import { DisableRecentsDialog } from '../../../../../features/locations/components';
import { useRecents } from '../../../../../features/locations/hooks';
import { Menu, type MenuProps } from '../../../../../lib/components/menu';
import { useHistory } from '../../../../../lib/history';

export type HeaderMenuProps = MenuProps;

// -----------------------------------------------------------------------------
// HeaderMenu · 3-dots dropdown for the select-location topbar
// (Filters · Disable/Enable recents).
//
// VPN.vu polish: repaint the lib Menu.Popup with the cyan glassmorph card
// treatment used elsewhere in the kit (multihop info card, scope bar).
// We wrap with `styled(Menu.Popup)` so the lib's internal :popover-open
// transitions and outside-click hooks stay intact — we only override the
// surface colors + the option hover state.
// -----------------------------------------------------------------------------

export function HeaderMenu({ onOpenChange, ...props }: HeaderMenuProps) {
  const history = useHistory();
  const { hasRecents, setEnabledRecents } = useRecents();
  const navigateToFilter = React.useCallback(() => history.push(RoutePath.filter), [history]);

  const [disableRecentsDialogOpen, setDisableRecentsDialogOpen] = React.useState(false);

  const openDisableRecentsDialog = React.useCallback(() => {
    setDisableRecentsDialogOpen(true);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const enableRecents = React.useCallback(async () => {
    await setEnabledRecents(true);
    onOpenChange?.(false);
  }, [onOpenChange, setEnabledRecents]);

  return (
    <>
      <Menu onOpenChange={onOpenChange} {...props}>
        <StyledPopup>
          <Menu.Option>
            <Menu.Option.Trigger onClick={navigateToFilter}>
              <Menu.Option.Item>
                <Menu.Option.Item.Icon icon="filter" />
                <Menu.Option.Item.Label>{messages.gettext('Filters')}</Menu.Option.Item.Label>
              </Menu.Option.Item>
            </Menu.Option.Trigger>
          </Menu.Option>
          <Menu.Option>
            <Menu.Option.Trigger onClick={hasRecents ? openDisableRecentsDialog : enableRecents}>
              <Menu.Option.Item>
                <Menu.Option.Item.Icon icon="history-remove" />
                <Menu.Option.Item.Label>
                  {hasRecents
                    ? // TRANSLATORS: Used in button to disable showing list of recent locations.
                      messages.pgettext('select-location-view', 'Disable recents')
                    : // TRANSLATORS: Used in button to enable showing list of recent locations.
                      messages.pgettext('select-location-view', 'Enable recents')}
                </Menu.Option.Item.Label>
              </Menu.Option.Item>
            </Menu.Option.Trigger>
          </Menu.Option>
        </StyledPopup>
      </Menu>
      <DisableRecentsDialog
        open={disableRecentsDialogOpen}
        onOpenChange={setDisableRecentsDialogOpen}
      />
    </>
  );
}

// Cyan-tint glass override for the Menu.Popup surface. The lib styles flat
// `colors.blue40` (#1A4155); we swap it for a softer translucent surface with
// the cyan accent border + cyan glow shadow. Option rows get a hover/active
// repaint so the cursor feedback reads as part of the VPN.vu identity.
const StyledPopup = styled(Menu.Popup)`
  && {
    background-color: rgba(10, 33, 40, 0.96);
    border: 1px solid rgba(91, 200, 218, 0.32);
    border-radius: 12px;
    padding: 6px;
    min-width: 200px;
    max-width: 100%;
    box-shadow:
      0 16px 36px -12px rgba(0, 0, 0, 0.55),
      0 0 32px -12px rgba(91, 200, 218, 0.35),
      0 0 0 1px rgba(255, 255, 255, 0.02) inset;
    backdrop-filter: blur(20px);
  }

  /* Option row hover/active · cyan tint instead of the flat blue40 default. */
  button:not(:disabled):hover > div {
    background-color: rgba(91, 200, 218, 0.12) !important;
  }
  button:not(:disabled):active > div {
    background-color: rgba(91, 200, 218, 0.2) !important;
  }

  /* Base option item · transparent so the popup tint shows through. */
  button > div {
    background-color: transparent !important;
    transition: background-color 140ms ease;
    border-radius: 8px;
    padding: 8px 10px;
    gap: 10px;
  }
`;
