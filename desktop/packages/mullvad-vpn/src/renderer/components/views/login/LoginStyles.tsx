import styled from 'styled-components';

import { Icon, Layout } from '../../../lib/components';
import { colors, spacings } from '../../../lib/foundations';
import { hugeText, largeText, smallText, tinyText } from '../../common-styles';
import FormattableTextInput from '../../FormattableTextInput';

export const StyledAccountDropdownContainer = styled.ul({
  display: 'flex',
  flexDirection: 'column',
});

export const StyledInputSubmitIcon = styled(Icon)<{ $visible: boolean }>((props) => ({
  opacity: props.$visible ? 1 : 0,
}));

export const StyledAccountDropdownItem = styled.li({
  display: 'flex',
  flex: 1,
});

const baseButtonStyles = {
  width: '100%',
  height: '100%',
  backgroundColor: colors.whiteAlpha60,
  cursor: 'default',
  '&&:hover': {
    backgroundColor: colors.whiteAlpha40,
  },
  '&:focus-visible': {
    outline: `2px solid ${colors.white}`,
    outlineOffset: '-2px',
  },
};

export const StyledAccountDropdownItemButton = styled.button({
  ...baseButtonStyles,
  paddingLeft: spacings.medium,
});

export const StyledAccountDropdownItemIconButton = styled.button({
  ...baseButtonStyles,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const StyledStatusIcon = styled.div({
  display: 'flex',
  alignSelf: 'end',
  flex: 0,
  justifyContent: 'center',
  marginTop: spacings.large,
  height: '48px',
  minHeight: '48px',
});

interface IStyledAccountInputGroupProps {
  $editable: boolean;
  $active: boolean;
  $error: boolean;
}

export const StyledAccountInputGroup = styled.div<IStyledAccountInputGroupProps>((props) => ({
  borderWidth: '1.5px',
  borderStyle: 'solid',
  borderRadius: '12px',
  overflow: 'hidden',
  borderColor: props.$error
    ? 'rgba(227, 67, 73, 0.6)'
    : props.$active
      ? 'rgba(91, 200, 218, 0.6)'
      : 'rgba(255, 255, 255, 0.12)',
  boxShadow: props.$active && !props.$error ? '0 0 0 4px rgba(91, 200, 218, 0.12)' : 'none',
  opacity: props.$editable ? 1 : 0.6,
  transition: 'border-color 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms cubic-bezier(0.22, 1, 0.36, 1)',
}));

export const StyledAccountInputBackdrop = styled.div({
  display: 'flex',
  backgroundColor: colors.darkBlue,
  borderColor: 'transparent',
});

export const StyledDropdownSpacer = styled.div({
  height: 1,
  backgroundColor: colors.darkBlue,
});

export const StyledTitle = styled.h1(hugeText, {
  lineHeight: '40px',
  marginBottom: '7px',
  flex: 0,
});

export const StyledInput = styled(FormattableTextInput)(largeText, {
  fontWeight: 700,
  minWidth: 0,
  borderWidth: 0,
  padding: '12px 12px 12px',
  color: colors.white,
  backgroundColor: 'transparent',
  letterSpacing: '0.08em',
  flex: 1,
  '&&::placeholder': {
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

export const StyledBlockMessageContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignSelf: 'start',
  backgroundColor: colors.darkBlue,
  borderRadius: '8px',
  padding: '16px',
});

export const StyledBlockTitle = styled.div(smallText, {
  color: colors.white,
  marginBottom: '5px',
  fontWeight: 700,
});

export const StyledBlockMessage = styled.div(tinyText, {
  color: colors.white,
  marginBottom: '10px',
});

export const StyledLine = styled(Layout)`
  height: 1px;
  width: 100%;
  background-color: ${colors.whiteAlpha20};
`;
