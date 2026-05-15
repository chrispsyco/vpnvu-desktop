import React from 'react';
import styled, { css } from 'styled-components';

import { colors, Radius, spacings } from '../../foundations';
import { TransientProps } from '../../types';
import { ButtonProvider } from './ButtonContext';
import { ButtonIcon, ButtonText, StyledButtonIcon, StyledButtonText } from './components';

export type ButtonProps = React.ComponentPropsWithRef<'button'> & {
  variant?: 'primary' | 'success' | 'destructive';
  width?: 'fill' | 'fit';
};

const styles = {
  radius: Radius.radius12,
  variants: {
    primary: {
      background: colors.blue80,
      hover: colors.blue60,
      pressed: colors.blue40,
      disabled: colors.blue40,
      glow: '0 0 24px rgba(9, 158, 180, 0.25)',
    },
    success: {
      background: colors.green,
      hover: colors.green80,
      pressed: colors.green40,
      disabled: colors.green40,
      glow: '0 0 24px rgba(68, 173, 77, 0.22)',
    },
    destructive: {
      background: colors.red,
      hover: colors.red80,
      pressed: colors.red40,
      disabled: colors.red40,
      glow: '0 0 24px rgba(227, 67, 73, 0.22)',
    },
  },
};

export const StyledButton = styled.button<TransientProps<Pick<ButtonProps, 'variant' | 'width'>>>`
  ${({ $width = 'fill', $variant = 'primary' }) => {
    const variant = styles.variants[$variant];

    return css`
      --background: ${variant.background};
      --hover: ${variant.hover};
      --pressed: ${variant.pressed};
      --disabled: ${variant.disabled};
      --glow: ${variant.glow};
      --radius: ${styles.radius};
      --transition-duration: 0.15s;

      display: flex;
      align-items: center;
      padding: ${spacings.small} ${spacings.medium};
      gap: ${spacings.small};
      overflow-wrap: anywhere;
      font-weight: 600;
      letter-spacing: -0.005em;

      min-height: 44px;
      min-width: 60px;
      border-radius: var(--radius);
      background: var(--background);
      box-shadow: var(--glow);

      ${() => {
        if ($width === 'fill') {
          return css`
            width: 100%;
          `;
        } else if ($width === 'fit') {
          return css`
            width: fit-content;
            max-width: 100%;
          `;
        }
        return null;
      }}

      @media (prefers-reduced-motion: no-preference) {
        transition:
          background-color var(--transition-duration) cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow var(--transition-duration) cubic-bezier(0.22, 1, 0.36, 1),
          transform var(--transition-duration) cubic-bezier(0.22, 1, 0.36, 1),
          filter 120ms ease;
      }

      &&:not(:disabled):hover {
        background: var(--hover);
        filter: brightness(1.06);
      }

      &&:not(:disabled):active {
        background: var(--pressed);
        filter: brightness(0.94);
        transform: translateY(1px);
      }

      &:disabled {
        background: var(--disabled);
        box-shadow: none;
        opacity: 0.7;
      }

      &:focus-visible {
        outline: 2px solid rgba(91, 200, 218, 0.7);
        outline-offset: 3px;
      }

      justify-content: space-between;
      &&:has(${StyledButtonText}:only-child) {
        justify-content: center;
      }
      &&:has(${StyledButtonText} + ${StyledButtonIcon}) {
        &::before {
          content: ' ';
          display: inline-block;
          width: 24px;
        }
      }
      &&:has(${StyledButtonIcon} + ${StyledButtonText}) {
        &::after {
          content: ' ';
          display: inline-block;
          width: 24px;
        }
      }
      &&:has(${StyledButtonIcon} + ${StyledButtonText} + ${StyledButtonIcon}) {
        &::before {
          display: none;
        }
        &::after {
          display: none;
        }
      }
    `;
  }}
`;

function Button({ children, variant, width, disabled = false, ...props }: ButtonProps) {
  return (
    <ButtonProvider disabled={disabled}>
      <StyledButton disabled={disabled} $variant={variant} $width={width} {...props}>
        {children}
      </StyledButton>
    </ButtonProvider>
  );
}

const ButtonNamespace = Object.assign(Button, {
  Text: ButtonText,
  Icon: ButtonIcon,
});

export { ButtonNamespace as Button };
