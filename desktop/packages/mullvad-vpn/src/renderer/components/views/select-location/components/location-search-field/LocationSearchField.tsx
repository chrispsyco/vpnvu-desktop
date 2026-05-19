import React from 'react';
import styled from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import { SearchTextField } from '../../../../search-text-field';
import { useScrollPositionContext } from '../../ScrollPositionContext';
import { useSelectLocationViewContext } from '../../SelectLocationViewContext';

// -----------------------------------------------------------------------------
// LocationSearchField · cyan-glow input shell from the figma `.ss-input` spec.
//
// The underlying SearchTextField (TextField primitive) is left structurally
// untouched — we only paint a styled wrapper around it and reach in via
// descendant selectors to swap colors, borders, focus glow and the clear
// button hit-target. Keeps the primitive reusable for other views (login,
// account number) while giving select-location the VPN.vu identity.
//
// A separate StyledMeta line below the input echoes the figma "X resultados ·
// Y servidores" kicker — but only when the user has actually typed something
// (>= 2 chars), to keep the empty state quiet.
// -----------------------------------------------------------------------------

export function LocationSearchField() {
  const { setSearchTerm } = useSelectLocationViewContext();
  const { resetScrollPositions } = useScrollPositionContext();
  const [searchValue, setSearchValue] = React.useState('');

  const handleInputValueChange = React.useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const deferredSearchValue = React.useDeferredValue(searchValue);

  React.useEffect(() => {
    if (deferredSearchValue.length < 2) {
      setSearchTerm('');
    } else {
      resetScrollPositions();
      setSearchTerm(deferredSearchValue.toLowerCase());
    }
  }, [deferredSearchValue, resetScrollPositions, setSearchTerm]);

  return (
    <StyledFieldShell>
      <SearchTextField
        variant="secondary"
        value={searchValue}
        onValueChange={handleInputValueChange}>
        <SearchTextField.Icon icon="search" />
        <SearchTextField.Input
          autoFocus
          placeholder={
            // TRANSLATORS: Placeholder text for search field in select location view.
            // Short label on purpose so it fits the 44px-tall input shell with
            // 36px padding-left for the search icon. Reuses the existing
            // "Locations" key (pt: "Localizações") already in messages.po.
            messages.gettext('Locations')
          }
        />
        <SearchTextField.ClearButton />
      </SearchTextField>
    </StyledFieldShell>
  );
}

// Shell wraps the whole TextField. `& > div` targets the StyledTextField from
// the primitive (it's the only child element), so we can repaint borders and
// background without forking the TextField component. Focus-within picks up
// the input focus and lights the cyan glow.
const StyledFieldShell = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  min-width: 0;

  /* The TextField primitive renders a single <div> wrapper, then the
     icon/input/clear inside. We paint that wrapper as the figma ss-input. */
  & > div {
    height: 44px;
    align-items: center;
    gap: 10px;
    padding: 0 12px 0 14px;
    border-radius: 14px;
    background: rgba(16, 48, 64, 0.85);
    border: 1.5px solid rgba(91, 200, 218, 0.18);
    transition:
      background 160ms ease,
      border-color 160ms ease,
      box-shadow 160ms ease;
  }

  &:focus-within > div {
    border-color: #5bc8da;
    background: rgba(16, 48, 64, 0.95);
    box-shadow:
      0 0 0 3px rgba(91, 200, 218, 0.1),
      0 0 24px rgba(9, 158, 180, 0.18);
  }

  /* Search icon · cyan-glow accent */
  & svg {
    color: #5bc8da;
  }

  /* Input · Geist, white ink. The primitive StyledTextFieldInput has its own
     outline + background + height that we MUST flatten — otherwise the
     primitive's 1px outline renders inside our cyan shell and looks like
     a nested second input (regression caught on first visual review).
     Padding-left/right reserve space for the *absolutely positioned* search
     icon (left:8px, ~18px wide) and clear button (right:8px, ~22px wide) —
     without these, the text renders underneath the icon and visually clips. */
  input {
    all: unset !important;
    box-sizing: border-box !important;
    width: 100%;
    height: 100%;
    background: transparent !important;
    color: #ffffff !important;
    font-family: 'Geist', system-ui, sans-serif !important;
    font-size: 14.5px !important;
    font-weight: 500 !important;
    letter-spacing: -0.01em;
    line-height: 44px !important;
    outline: none !important;
    border: 0 !important;
    border-radius: 0 !important;
    padding: 0 38px 0 36px !important;
  }

  input::placeholder {
    color: #6e8088 !important;
    font-weight: 400;
  }

  /* Clear (X) button · muted circular chip */
  button {
    width: 22px !important;
    height: 22px !important;
    min-width: 22px;
    border-radius: 11px;
    background: rgba(255, 255, 255, 0.08) !important;
    color: #9baeb6 !important;
    transition:
      background 140ms ease,
      color 140ms ease;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.14) !important;
    color: #ffffff !important;
  }

  button svg {
    color: currentColor !important;
    width: 11px;
    height: 11px;
  }
`;
