import styled from 'styled-components';

import { colors } from '../../foundations';
import { TransientProps } from '../../types';
import { Flex } from '../flex';
import { MainHeaderIconButton } from './components';

type HeaderVariant = 'default' | 'success' | 'error';

export type HeaderProps = React.PropsWithChildren<{
  size?: '1' | '2';
  variant?: HeaderVariant;
}>;

const sizes = {
  '1': '68px',
  '2': '80px',
};

// State-tinted overlay on top of bg-deep — sutil, alinhado com figma mobile.
// Each state paints the header background with a 14-16% alpha overlay of its
// semantic color, plus a matching low-alpha bottom border for definition.
const variantStyles: Record<HeaderVariant, { bg: string; border: string }> = {
  default: {
    bg: 'rgba(91, 200, 218, 0.06)',
    border: 'rgba(91, 200, 218, 0.12)',
  },
  success: {
    bg: 'rgba(68, 173, 77, 0.14)',
    border: 'rgba(68, 173, 77, 0.22)',
  },
  error: {
    bg: 'rgba(227, 67, 73, 0.14)',
    border: 'rgba(227, 67, 73, 0.22)',
  },
};

const StyledHeader = styled.header<TransientProps<HeaderProps>>(
  ({ $size = '1', $variant = 'default' }) => {
    const v = variantStyles[$variant];
    return {
      height: sizes[$size],
      minHeight: sizes[$size],
      backgroundColor: colors.darkerBlue50,
      backgroundImage: `linear-gradient(${v.bg}, ${v.bg})`,
      borderBottom: `1px solid ${v.border}`,
      transition:
        'height 250ms ease-in-out, min-height 250ms ease-in-out, background-image 280ms cubic-bezier(0.22, 1, 0.36, 1), border-color 280ms cubic-bezier(0.22, 1, 0.36, 1)',
    };
  },
);

const MainHeader = ({ size = '1', variant = 'default', children, ...props }: HeaderProps) => {
  return (
    <StyledHeader $size={size} $variant={variant} data-app-region="drag" {...props}>
      <Flex
        flexDirection="column"
        justifyContent="center"
        margin={{
          horizontal: 'medium',
          top: 'medium',
          bottom: 'small',
        }}>
        {children}
      </Flex>
    </StyledHeader>
  );
};

const MainHeaderNamespace = Object.assign(MainHeader, {
  IconButton: MainHeaderIconButton,
});

export { MainHeaderNamespace as MainHeader };
