import React from 'react';
import styled, { css } from 'styled-components';

import { colors } from '../../../../foundations';
import { useSwitchContext } from '../../SwitchContext';

export type SwitchInputProps = React.ComponentPropsWithRef<'input'>;

export const StyledSwitchInput = styled.input<{
  $checked?: boolean;
  $disabled?: boolean;
}>`
  ${({ $checked, $disabled }) => {
    const trackBg = $disabled
      ? 'rgba(255, 255, 255, 0.06)'
      : $checked
        ? colors.blue80
        : 'rgba(255, 255, 255, 0.10)';
    const trackBorder = $disabled
      ? 'rgba(255, 255, 255, 0.12)'
      : $checked
        ? 'rgba(91, 200, 218, 0.6)'
        : 'rgba(255, 255, 255, 0.12)';
    const thumbColor = $disabled ? 'rgba(255, 255, 255, 0.4)' : colors.white;
    const glow = $checked && !$disabled
      ? '0 0 0 1px rgba(91, 200, 218, 0.3), 0 0 16px rgba(9, 158, 180, 0.4)'
      : 'none';

    return css`
      --transition-duration: 0.2s;
      --scale: 1;

      appearance: none;
      margin: 0;
      padding: 0;

      box-sizing: border-box;
      vertical-align: middle;
      position: relative;
      display: flex;
      align-items: center;
      width: 44px;
      height: 26px;
      background: ${trackBg};
      border: 1px solid ${trackBorder};
      border-radius: 100px;
      box-shadow: ${glow};
      cursor: ${$disabled ? 'default' : 'pointer'};
      transition:
        background-color var(--transition-duration) ease,
        border-color var(--transition-duration) ease,
        box-shadow var(--transition-duration) ease;

      &&:not(:disabled):hover {
        --scale: 1.08;
      }

      &&:focus-visible {
        outline: 2px solid ${colors.white};
        outline-offset: 2px;
      }

      &&::before {
        content: '';
        position: absolute;
        left: 2px;
        background-color: ${thumbColor};
        min-width: 20px;
        width: 20px;
        aspect-ratio: 1 / 1;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        transform-origin: center;
        transition:
          transform var(--transition-duration) cubic-bezier(0.22, 1, 0.36, 1),
          background-color var(--transition-duration) linear;
        transform: translateX(${$checked ? '20px' : '0px'}) scale(var(--scale));
      }
    `;
  }}
`;

export function SwitchInput(props: SwitchInputProps) {
  const { inputId, checked, onCheckedChange, descriptionId, disabled } = useSwitchContext();

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    },
    [onCheckedChange],
  );

  return (
    <StyledSwitchInput
      id={inputId}
      type="checkbox"
      role="switch"
      checked={checked}
      disabled={disabled}
      onChange={handleChange}
      aria-describedby={descriptionId}
      $checked={checked}
      $disabled={disabled}
      {...props}
    />
  );
}
