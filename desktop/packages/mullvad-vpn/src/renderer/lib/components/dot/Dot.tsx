import styled from 'styled-components';

import { colors } from '../../foundations';

export interface DotProps {
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'tiny' | 'small' | 'medium';
}

// Status dots emit a subtle glow matching their semantic color (positive=green,
// negative=red, warning=amber, pending/primary=cyan brand-glow) — mirrors the
// vpn.vu mobile figma pattern (.conn-card__status-dot.positive { box-shadow:
// 0 0 8px ... }). currentColor is used so the halo automatically tracks the
// background color without needing a duplicated rgba var per variant.
const StyledDiv = styled.div<{ $size: string; $color: string }>`
  min-width: ${({ $size }) => $size};
  width: ${({ $size }) => $size};
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  color: ${({ $color }) => $color};
  box-shadow: 0 0 8px currentColor;
`;

const sizes = {
  tiny: '8px',
  small: '10px',
  medium: '12px',
};

const dotColors = {
  // "primary" doubles as the "pending"/brand variant — uses cyan brand-glow.
  primary: colors.blue80,
  success: colors.green,
  warning: colors.yellow,
  error: colors.red,
};

export const Dot = ({ variant = 'primary', size = 'medium', ...props }: DotProps) => {
  return <StyledDiv $size={sizes[size]} $color={dotColors[variant]} {...props} />;
};
