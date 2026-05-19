import styled, { css, keyframes } from 'styled-components';

import { colors, spacings } from '../../../lib/foundations';
import { geistMono } from '../../common-styles';

// =============================================================================
// MOTION · stagger reveal on mount + scroll-hint bounce
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

const bounceDown = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
`;

// =============================================================================
// ROOT · stacking context + atmosphere mesh behind the disclaimer card
// =============================================================================

export const StyledRoot = styled.div({
  position: 'relative',
  isolation: 'isolate',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  minHeight: 0,
  padding: `${spacings.large} ${spacings.medium} ${spacings.medium}`,
});

export const StyledAtmosphere = styled.div(
  {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: -1,
    background: [
      'radial-gradient(ellipse 1200px 800px at 20% 20%, rgba(9, 158, 180, 0.10), transparent 60%)',
      'radial-gradient(ellipse 800px 600px at 90% 80%, rgba(91, 200, 218, 0.06), transparent 60%)',
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
// HEADER · brand mark + step counter (1 de 3 · Privacidade)
// =============================================================================

export const StyledHeader = styled.div(
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '22px',
    flexShrink: 0,
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

export const StyledBrand = styled.div({
  fontFamily: '"Geist", sans-serif',
  fontSize: '17px',
  fontWeight: 800,
  letterSpacing: '-0.015em',
  color: colors.white,
});

export const StyledBrandTld = styled.span({
  color: colors.whiteOnBlue40,
});

export const StyledStep = styled.div({
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: colors.whiteOnDarkBlue40,
});

export const StyledStepNumber = styled.b({
  color: colors.whiteOnBlue40,
  fontWeight: 600,
});

// =============================================================================
// HERO · kicker eyebrow + headline
// =============================================================================

export const StyledHero = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'relative',
    zIndex: 1,
  },
  css`
    animation: ${fadeUp} 380ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

export const StyledKicker = styled.div({
  fontFamily: geistMono,
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.20em',
  textTransform: 'uppercase',
  color: colors.whiteOnBlue40,
  marginBottom: '10px',
});

export const StyledTitle = styled.h1({
  fontFamily: '"Geist", sans-serif',
  fontSize: '32px',
  fontWeight: 900,
  letterSpacing: '-0.035em',
  lineHeight: 1.0,
  color: colors.white,
  marginBottom: '20px',
});

export const StyledTitleAccent = styled.span({
  color: colors.whiteOnBlue40,
});

// =============================================================================
// SCROLL · card with fade gradients + custom vertical track
// =============================================================================

export const StyledScrollWrap = styled.div(
  {
    flex: 1,
    display: 'flex',
    gap: '10px',
    minHeight: 0,
    position: 'relative',
    zIndex: 1,
  },
  css`
    animation: ${fadeUp} 440ms cubic-bezier(0.22, 1, 0.36, 1) 160ms both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

export const StyledScrollBody = styled.div({
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '14px',
  background: 'rgba(10, 33, 40, 0.5)',
  border: '1px solid rgba(91, 200, 218, 0.10)',
});

interface IFadeProps {
  $visible: boolean;
}

export const StyledFadeTop = styled.div<IFadeProps>((props) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '28px',
  background: 'linear-gradient(to bottom, rgba(10, 33, 40, 1), rgba(10, 33, 40, 0))',
  pointerEvents: 'none',
  zIndex: 2,
  opacity: props.$visible ? 1 : 0,
  transition: 'opacity 220ms ease-out',
}));

export const StyledFadeBottom = styled.div<IFadeProps>((props) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '28px',
  background: 'linear-gradient(to top, rgba(10, 33, 40, 1), rgba(10, 33, 40, 0))',
  pointerEvents: 'none',
  zIndex: 2,
  opacity: props.$visible ? 1 : 0,
  transition: 'opacity 220ms ease-out',
}));

export const StyledScrollInner = styled.div({
  height: '100%',
  overflowY: 'auto',
  padding: '18px 16px 22px',
  position: 'relative',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

// =============================================================================
// SECTIONS · h + p pairs with cyan-pastel eyebrows
// =============================================================================

export const StyledSection = styled.section({
  marginBottom: '14px',
  '&:last-child': {
    marginBottom: 0,
  },
});

export const StyledSectionHeading = styled.h2({
  fontFamily: geistMono,
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: '#79C8D3',
  marginBottom: '6px',
});

export const StyledSectionParagraph = styled.p({
  fontFamily: '"Geist", sans-serif',
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: 1.55,
  color: colors.whiteOnDarkBlue60,
  '& strong': {
    color: colors.white,
    fontWeight: 600,
  },
});

export const StyledSectionBigHeadline = styled.div({
  fontFamily: '"Geist", sans-serif',
  fontSize: '18px',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: colors.white,
  lineHeight: 1.2,
  marginBottom: '8px',
  '& .positive': {
    color: colors.green,
  },
});

// =============================================================================
// SCROLL TRACK · custom thin cyan track that mirrors the body scroll progress
// =============================================================================

export const StyledTrack = styled.div({
  width: '3px',
  borderRadius: '2px',
  background: 'rgba(91, 200, 218, 0.08)',
  position: 'relative',
  flexShrink: 0,
});

export const StyledTrackBar = styled.div<{ $top: number; $height: number }>((props) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: `${props.$top}%`,
  height: `${props.$height}%`,
  background: 'linear-gradient(180deg, #5BC8DA, #099EB4)',
  borderRadius: '2px',
  boxShadow: '0 0 8px rgba(91, 200, 218, 0.5)',
  transition: 'top 80ms ease-out, height 80ms ease-out',
}));

// =============================================================================
// HINT · "Role pra ler tudo" → check when finished
// =============================================================================

interface IHintProps {
  $done: boolean;
}

export const StyledHint = styled.div<IHintProps>((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '12px',
  padding: '10px 0',
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  color: props.$done ? colors.green : colors.whiteOnDarkBlue40,
  flexShrink: 0,
  position: 'relative',
  zIndex: 1,
  transition: 'color 220ms ease-out',
}));

export const StyledHintArrow = styled.span(
  {
    width: '16px',
    height: '16px',
    display: 'inline-flex',
    color: '#5BC8DA',
  },
  css`
    animation: ${bounceDown} 1.4s ease-in-out infinite;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

export const StyledHintCheck = styled.span({
  width: '18px',
  height: '18px',
  borderRadius: '9px',
  background: 'rgba(68, 173, 77, 0.18)',
  color: colors.green,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// =============================================================================
// CTAS · primary "accept" + ghost "policy" with hover micro-elevation
// =============================================================================

export const StyledCtaGroup = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '10px',
    flexShrink: 0,
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

interface IPrimaryButtonProps {
  $enabled: boolean;
}

export const StyledPrimaryButton = styled.button<IPrimaryButtonProps>((props) => ({
  height: '48px',
  borderRadius: '14px',
  border: 0,
  fontFamily: '"Geist", sans-serif',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  color: colors.white,
  cursor: props.$enabled ? 'pointer' : 'not-allowed',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  background: props.$enabled
    ? 'linear-gradient(135deg, #5BC8DA, #099EB4)'
    : 'rgba(9, 158, 180, 0.20)',
  boxShadow: props.$enabled
    ? '0 12px 28px -8px rgba(91, 200, 218, 0.6), 0 0 24px rgba(9, 158, 180, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.10)'
    : 'none',
  opacity: props.$enabled ? 1 : 0.55,
  transition:
    'background 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
  '&:hover:not(:disabled)': props.$enabled
    ? {
        transform: 'translateY(-1px)',
        boxShadow:
          '0 16px 32px -8px rgba(91, 200, 218, 0.7), 0 0 32px rgba(9, 158, 180, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.14)',
      }
    : undefined,
  '&:active:not(:disabled)': {
    transform: 'translateY(0)',
  },
  '&:focus-visible': {
    outline: `2px solid ${colors.whiteOnBlue40}`,
    outlineOffset: '3px',
  },
}));

// =============================================================================
// CHECKBOX · cyan toggle for step 3 (opt-in to anonymous crash reports). We
// roll our own here instead of importing the shared <Switch /> component
// because that component is wired to redux state we don't want to touch on
// a one-shot wizard view. Visually mirrors the `.pri__checkbox` from the
// figma reference (08-privacy-disclaimer-screen.html).
// =============================================================================

interface ICheckboxProps {
  $checked: boolean;
}

// Row props are still typed (so the inner box can read them) but the row
// itself doesn't need them for styling — visual feedback for the checked
// state lives on `StyledCheckboxBox`, not on the outer button.
export const StyledCheckboxRow = styled.button<ICheckboxProps>({
  appearance: 'none',
  WebkitAppearance: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 4px',
  marginTop: '4px',
  width: '100%',
  background: 'transparent',
  border: 0,
  cursor: 'pointer',
  textAlign: 'left',
  color: 'inherit',
  flexShrink: 0,
  position: 'relative',
  zIndex: 1,
  transition: 'opacity 180ms ease-out',
  '&:hover': {
    opacity: 0.85,
  },
  '&:focus-visible': {
    outline: `2px solid ${colors.whiteOnBlue40}`,
    outlineOffset: '3px',
    borderRadius: '6px',
  },
});

export const StyledCheckboxBox = styled.span<ICheckboxProps>((props) => ({
  width: '18px',
  height: '18px',
  borderRadius: '5px',
  border: props.$checked ? '1.5px solid #099EB4' : '1.5px solid rgba(91, 200, 218, 0.32)',
  background: props.$checked ? 'linear-gradient(135deg, #5BC8DA, #099EB4)' : 'rgba(10, 33, 40, 0.6)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: colors.white,
  transition: 'background 180ms ease-out, border-color 180ms ease-out',
  boxShadow: props.$checked ? '0 0 12px rgba(91, 200, 218, 0.45)' : 'none',
}));

export const StyledCheckboxLabel = styled.span({
  fontFamily: '"Geist", sans-serif',
  fontSize: '12px',
  fontWeight: 500,
  letterSpacing: '-0.005em',
  color: colors.whiteOnDarkBlue80,
  lineHeight: 1.4,
});

// =============================================================================
// SECTION DIVIDER · subtle cyan rule between major content blocks inside
// the scroll body. Used on steps 2 and 3 to break up dense LGPD/telemetry
// copy without resorting to a stronger border that would fight the card edge.
// =============================================================================

export const StyledSectionDivider = styled.hr({
  border: 0,
  height: '1px',
  margin: '14px 0',
  background:
    'linear-gradient(90deg, rgba(91, 200, 218, 0) 0%, rgba(91, 200, 218, 0.18) 50%, rgba(91, 200, 218, 0) 100%)',
});

export const StyledGhostButton = styled.button({
  height: '48px',
  borderRadius: '14px',
  background: 'transparent',
  border: `1px solid ${colors.whiteAlpha20}`,
  color: colors.whiteOnDarkBlue80,
  fontFamily: '"Geist", sans-serif',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition:
    'border-color 220ms cubic-bezier(0.22, 1, 0.36, 1), color 220ms cubic-bezier(0.22, 1, 0.36, 1), background-color 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
  '&:hover': {
    color: colors.white,
    borderColor: 'rgba(91, 200, 218, 0.5)',
    backgroundColor: 'rgba(91, 200, 218, 0.05)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:focus-visible': {
    outline: `2px solid ${colors.whiteOnBlue40}`,
    outlineOffset: '3px',
  },
});
