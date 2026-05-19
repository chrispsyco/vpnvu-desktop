import styled, { css, keyframes } from 'styled-components';

import { Icon, Layout } from '../../../lib/components';
import { colors, spacings } from '../../../lib/foundations';
import { geistMono, hugeText, smallText, tinyText } from '../../common-styles';
import FormattableTextInput from '../../FormattableTextInput';

// =============================================================================
// MOTION · stagger reveal for the login form on mount
// =============================================================================

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const subtleGlow = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.85; }
`;

// =============================================================================
// ATMOSPHERE · radial gradient mesh behind the login form, sitting underneath
// the View flow but pinned to the viewport. Two cyan radial blooms create the
// vpnvu signature atmosphere from the figma (top-left + bottom-right).
// =============================================================================

// Root wrapper for the LoginView. Creates its own stacking context via
// `isolation: isolate` so the absolutely-positioned atmosphere stays bounded
// to the view (instead of bleeding out behind a fixed viewport) and content
// renders above it without per-element zIndex bookkeeping.
export const StyledLoginRoot = styled.div({
  position: 'relative',
  isolation: 'isolate',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  minHeight: 0,
});

export const StyledLoginAtmosphere = styled.div(
  {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: -1,
    background: [
      'radial-gradient(ellipse 1200px 800px at 20% 18%, rgba(9, 158, 180, 0.12), transparent 60%)',
      'radial-gradient(ellipse 800px 600px at 90% 82%, rgba(91, 200, 218, 0.08), transparent 60%)',
    ].join(', '),
  },
  css`
    animation: ${subtleGlow} 8s ease-in-out infinite;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
      opacity: 0.7;
    }
  `,
);

// =============================================================================
// HERO · kicker eyebrow + title + description
// =============================================================================

export const StyledLoginHero = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: spacings.tiny,
    position: 'relative',
    zIndex: 1,
  },
  css`
    animation: ${fadeUp} 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

export const StyledLoginKicker = styled.div({
  fontFamily: geistMono,
  fontSize: '11px',
  fontWeight: 600,
  lineHeight: '15px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: colors.whiteOnBlue40,
});

export const StyledLoginDescription = styled.p({
  fontSize: '13px',
  lineHeight: '20px',
  fontWeight: 400,
  color: colors.whiteOnDarkBlue60,
  marginTop: '4px',
  maxWidth: '320px',
});

// =============================================================================
// FORM · field group with staggered reveal
// =============================================================================

export const StyledLoginFormStagger = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: spacings.medium,
    position: 'relative',
    zIndex: 1,
  },
  css`
    animation: ${fadeUp} 420ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

export const StyledLoginFieldLabel = styled.label({
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 600,
  lineHeight: '14px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: colors.whiteOnDarkBlue60,
});

// =============================================================================
// INPUT · refined card with focus glow + error state
// =============================================================================

interface IStyledAccountInputGroupProps {
  $editable: boolean;
  $active: boolean;
  $error: boolean;
}

export const StyledAccountInputGroup = styled.div<IStyledAccountInputGroupProps>((props) => ({
  borderWidth: '1.5px',
  borderStyle: 'solid',
  borderRadius: '14px',
  overflow: 'hidden',
  borderColor: props.$error
    ? 'rgba(227, 67, 73, 0.62)'
    : props.$active
      ? 'rgba(91, 200, 218, 0.6)'
      : 'rgba(255, 255, 255, 0.10)',
  boxShadow: props.$error
    ? '0 0 0 4px rgba(227, 67, 73, 0.12), 0 8px 24px -12px rgba(0, 0, 0, 0.4)'
    : props.$active
      ? '0 0 0 4px rgba(91, 200, 218, 0.14), 0 8px 24px -12px rgba(0, 0, 0, 0.4)'
      : '0 8px 24px -12px rgba(0, 0, 0, 0.4)',
  opacity: props.$editable ? 1 : 0.6,
  backgroundColor: colors.darkBlue,
  transition:
    'border-color 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
  transform: props.$active && !props.$error ? 'translateY(-1px)' : 'translateY(0)',
}));

export const StyledAccountInputBackdrop = styled.div({
  display: 'flex',
  alignItems: 'center',
  height: '56px',
  paddingLeft: '4px',
  backgroundColor: 'transparent',
  borderColor: 'transparent',
});

export const StyledInput = styled(FormattableTextInput)({
  fontFamily: geistMono,
  fontSize: '17px',
  fontWeight: 600,
  lineHeight: '24px',
  minWidth: 0,
  borderWidth: 0,
  padding: '12px 12px',
  color: colors.white,
  backgroundColor: 'transparent',
  letterSpacing: '0.08em',
  flex: 1,
  outline: 0,
  '&&::placeholder': {
    color: 'rgba(255, 255, 255, 0.32)',
    fontWeight: 500,
    letterSpacing: '0.04em',
  },
});

// =============================================================================
// INPUT MESSAGE · inline error helper below the field
// =============================================================================

export const StyledInputMessage = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: '16px',
  color: colors.red,
  marginTop: '4px',
  letterSpacing: '-0.005em',
});

// =============================================================================
// HISTORY DROPDOWN · refined surface card under the input
// =============================================================================

export const StyledAccountDropdownContainer = styled.ul({
  display: 'flex',
  flexDirection: 'column',
  background: 'transparent',
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const StyledInputSubmitIcon = styled(Icon)<{ $visible: boolean }>((props) => ({
  opacity: props.$visible ? 1 : 0,
}));

export const StyledAccountDropdownItem = styled.li({
  display: 'flex',
  flex: 1,
  borderTop: `1px solid ${colors.whiteAlpha20}`,
  transition: 'background-color 160ms ease-out',
  '&:hover': {
    backgroundColor: 'rgba(91, 200, 218, 0.08)',
  },
});

const baseButtonStyles = {
  width: '100%',
  height: '100%',
  background: 'transparent',
  border: 0,
  cursor: 'pointer',
  color: colors.white,
  fontFamily: geistMono,
  textAlign: 'left' as const,
  '&:focus-visible': {
    outline: `2px solid ${colors.whiteOnBlue40}`,
    outlineOffset: '-2px',
  },
};

export const StyledAccountDropdownItemButton = styled.button({
  ...baseButtonStyles,
  paddingLeft: spacings.medium,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const StyledAccountDropdownItemIconButton = styled.button({
  ...baseButtonStyles,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.whiteOnDarkBlue40,
  transition: 'color 160ms ease-out, background-color 160ms ease-out',
  '&:hover': {
    color: colors.red,
    backgroundColor: 'rgba(227, 67, 73, 0.08)',
  },
});

export const StyledDropdownSpacer = styled.div({
  height: 0,
  backgroundColor: 'transparent',
});

// =============================================================================
// STATUS ICON · used for spinner / success / failure during transitions
// =============================================================================

export const StyledStatusIcon = styled.div(
  {
    display: 'flex',
    alignSelf: 'center',
    flex: 0,
    justifyContent: 'center',
    marginTop: spacings.large,
    height: '48px',
    minHeight: '48px',
    position: 'relative',
    zIndex: 1,
  },
  css`
    animation: ${fadeUp} 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

// =============================================================================
// LEGACY · kept for backwards compatibility (no longer used directly but
// exported in case some other view imports them).
// =============================================================================

export const StyledTitle = styled.h1(hugeText, {
  lineHeight: '40px',
  marginBottom: '7px',
  flex: 0,
});

export const StyledBlockMessageContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignSelf: 'start',
  backgroundColor: colors.darkBlue,
  borderRadius: '12px',
  padding: '16px',
  border: `1px solid ${colors.whiteAlpha20}`,
});

export const StyledBlockTitle = styled.div(smallText, {
  color: colors.white,
  marginBottom: '5px',
  fontWeight: 700,
});

export const StyledBlockMessage = styled.div(tinyText, {
  color: colors.whiteOnDarkBlue80,
  marginBottom: '10px',
});

export const StyledLine = styled(Layout)`
  height: 1px;
  width: 100%;
  background-color: ${colors.whiteAlpha20};
`;

// =============================================================================
// ACTIONS · wrapper for the login button + secondary actions, staggered
// =============================================================================

export const StyledActionsStagger = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: spacings.small,
    position: 'relative',
    zIndex: 1,
  },
  css`
    animation: ${fadeUp} 460ms cubic-bezier(0.22, 1, 0.36, 1) 160ms both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

// =============================================================================
// SECONDARY ACTION · outline button used for "Create a new account"
// =============================================================================

export const StyledSecondaryAction = styled.button({
  minHeight: '52px',
  borderRadius: '14px',
  background: 'transparent',
  border: `1.5px solid ${colors.whiteAlpha20}`,
  color: colors.white,
  fontFamily: '"Geist", "Noto Sans Myanmar", "Noto Sans Thai", sans-serif',
  fontSize: '15px',
  fontWeight: 600,
  letterSpacing: '-0.005em',
  cursor: 'pointer',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: `0 ${spacings.medium}`,
  transition:
    'border-color 220ms cubic-bezier(0.22, 1, 0.36, 1), color 220ms cubic-bezier(0.22, 1, 0.36, 1), background-color 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
  '&:hover:not(:disabled)': {
    borderColor: colors.whiteOnBlue40,
    color: colors.whiteOnBlue40,
    backgroundColor: 'rgba(91, 200, 218, 0.05)',
    transform: 'translateY(-1px)',
  },
  '&:active:not(:disabled)': {
    transform: 'translateY(0)',
  },
  '&:focus-visible': {
    outline: `2px solid ${colors.whiteOnBlue40}`,
    outlineOffset: '3px',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

// =============================================================================
// DIVIDER · hairline cyan gradient that visually separates the primary
// "Login" action from the "Create a new account" secondary action.
// =============================================================================

export const StyledLoginDivider = styled.hr({
  border: 'none',
  height: '1px',
  background:
    'linear-gradient(90deg, transparent 0%, rgba(91, 200, 218, 0.22) 50%, transparent 100%)',
  margin: 0,
  position: 'relative',
  zIndex: 1,
});

// =============================================================================
// FOOTER · stacks the secondary action with subtle entrance
// =============================================================================

export const StyledLoginFooter = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: spacings.small,
    position: 'relative',
    zIndex: 1,
  },
  css`
    animation: ${fadeUp} 500ms cubic-bezier(0.22, 1, 0.36, 1) 240ms both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);
