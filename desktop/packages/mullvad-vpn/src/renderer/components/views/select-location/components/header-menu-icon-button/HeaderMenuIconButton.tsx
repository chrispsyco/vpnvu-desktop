import React from 'react';
import styled, { css } from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import { IconButton, type IconButtonProps } from '../../../../../lib/components';
import { HeaderMenu } from '../header-menu/HeaderMenu';

export type HeaderMenuIconButtonProps = IconButtonProps;

// -----------------------------------------------------------------------------
// HeaderMenuIconButton · 3-dots (•••) menu trigger in the topbar.
//
// VPN.vu polish: subtle cyan-glow ring on hover/open so the trigger feels
// like part of the cyan-tinted topbar instead of generic chrome. The lib
// IconButton ships a transparent shell — we wrap it in a styled span so we
// can paint background + glow + border without forking the primitive.
// -----------------------------------------------------------------------------

export function HeaderMenuIconButton(props: HeaderMenuIconButtonProps) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const toggleMenu = React.useCallback(() => {
    setOpen((open) => !open);
  }, [setOpen]);

  return (
    <>
      <StyledTriggerWrap $open={open}>
        <IconButton
          ref={buttonRef}
          variant="secondary"
          onClick={toggleMenu}
          aria-label={
            // TRANSLATORS: Label for button opening select location menu.
            messages.pgettext('accessibility', 'Open select location menu')
          }
          {...props}>
          <IconButton.Icon icon="more-horizontal-circle" />
        </IconButton>
      </StyledTriggerWrap>
      <HeaderMenu open={open} onOpenChange={toggleMenu} triggerRef={buttonRef} />
    </>
  );
}

// Wrapping in a span (not styled(IconButton)) keeps the lib's internal
// IconButtonProvider context wiring untouched — the gotcha from Batch 2
// where `styled(Component) as="X"` swapped out providers and broke icon color
// inheritance. Here the wrap is purely decorative chrome.
const StyledTriggerWrap = styled.span<{ $open: boolean }>(
  {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '999px',
    padding: '2px',
    transition: 'background-color 180ms ease, box-shadow 220ms ease',
  },
  ({ $open }) =>
    $open
      ? css`
          background-color: rgba(91, 200, 218, 0.14);
          box-shadow: 0 0 0 1px rgba(91, 200, 218, 0.35), 0 0 24px -10px rgba(91, 200, 218, 0.55);
        `
      : css`
          &:hover {
            background-color: rgba(91, 200, 218, 0.1);
            box-shadow: 0 0 0 1px rgba(91, 200, 218, 0.18);
          }
        `,
);
