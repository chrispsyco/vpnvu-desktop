import styled, { css, keyframes } from 'styled-components';

import { Image, Text } from '../../../lib/components';
import { colors, spacings } from '../../../lib/foundations';
import { geistMono } from '../../common-styles';

// =============================================================================
// MOTION · stagger reveal + soft atmosphere pulse
// =============================================================================

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// =============================================================================
// ROOT · creates its own stacking context so the atmosphere stays bounded to
// the view (no fixed/zIndex:0 — that would paint above content; we use
// absolute + zIndex:-1 inside an isolate wrapper instead).
// =============================================================================

export const StyledMultihopRoot = styled.div({
  position: 'relative',
  isolation: 'isolate',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  minHeight: 0,
});

// Atmosphere zeroed 2026-05-19 (alignment with Account view's flat darkBlue
// background). Wrapper stays as no-op so the JSX call site still mounts.
export const StyledMultihopAtmosphere = styled.div({
  display: 'none',
});

// =============================================================================
// HERO · kicker + gradient title (matches Account/Settings treatment)
// =============================================================================

export const StyledMultihopHero = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: spacings.tiny,
  },
  css`
    animation: ${fadeUp} 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

export const StyledMultihopKicker = styled.div({
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 600,
  lineHeight: '14px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: colors.whiteOnBlue40,
});

export const StyledMultihopTitle = styled(Text)`
  letter-spacing: -0.02em;
  background: linear-gradient(
    135deg,
    ${colors.white} 0%,
    ${colors.whiteOnBlue40} 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
`;

// =============================================================================
// STAGGER STACK · sequenced fade-up for direct children
// =============================================================================

export const StyledMultihopStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.large};

  > * {
    opacity: 0;
    animation: ${fadeUp} 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  > *:nth-child(1) {
    animation-delay: 80ms;
  }
  > *:nth-child(2) {
    animation-delay: 160ms;
  }
  > *:nth-child(3) {
    animation-delay: 240ms;
  }

  @media (prefers-reduced-motion: reduce) {
    > * {
      opacity: 1;
      animation: none;
    }
  }
`;

// =============================================================================
// INFO CARD · glassmorph cyan card holding the multihop illustration +
// explanation copy. Replaces the bare text + image stack with a single
// composed surface that anchors the page visually.
// =============================================================================

export const StyledInfoCard = styled.div({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: spacings.small,
  padding: spacings.medium,
  borderRadius: '18px',
  border: '1px solid rgba(91, 200, 218, 0.22)',
  background: 'linear-gradient(180deg, rgba(15, 46, 58, 0.78) 0%, rgba(7, 28, 38, 0.82) 100%)',
  backdropFilter: 'blur(28px) saturate(140%)',
  WebkitBackdropFilter: 'blur(28px) saturate(140%)',
  boxShadow:
    '0 18px 48px -28px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.02) inset, 0 0 80px -40px rgba(91, 200, 218, 0.4)',
  overflow: 'hidden',
});

export const StyledInfoCardKicker = styled.div({
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 600,
  lineHeight: '14px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: colors.whiteOnBlue40,
});

export const StyledInfoIllustration = styled(Image)({
  width: '100%',
  maxWidth: '320px',
  alignSelf: 'center',
  marginTop: spacings.tiny,
  marginBottom: spacings.tiny,
  // The illustration sits on the cyan-tinted glass surface; a subtle drop
  // shadow lifts it slightly without competing with the card glow.
  filter: 'drop-shadow(0 12px 28px rgba(0, 0, 0, 0.35))',
});

export const StyledInfoDescription = styled(Text)({
  color: colors.whiteOnDarkBlue80,
  lineHeight: '20px',
  letterSpacing: '-0.003em',
});

// =============================================================================
// SECTION · groups a kicker label + a stack of settings rows
// =============================================================================

export const StyledMultihopSection = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: spacings.small,
});

export const StyledSectionKicker = styled.div({
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 600,
  lineHeight: '14px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: colors.whiteOnDarkBlue60,
  paddingLeft: spacings.tiny,
});

// =============================================================================
// SERVER ROW · entry/exit selector cards mirroring the figma "Servers" group.
// Each row is a button that navigates to <SelectLocationView> with the right
// scope preselected. Visual state mirrors disabled (multihop off) by lowering
// opacity and removing the cyan glow on hover.
// =============================================================================

// `disabled` here is purely a *visual* hint — the button itself still uses the
// native disabled attribute when the multihop toggle is off. We avoid
// `styled(Component) as="button"` because that swaps out internal context
// providers (Link → LinkProvider, etc.) and the multihop screen has bitten us
// there before. A plain `styled.button` is enough.
export const StyledServerRow = styled.button<{ $disabled?: boolean }>(
  ({ $disabled }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacings.small,
    width: '100%',
    padding: `${spacings.small} ${spacings.medium}`,
    border: '1px solid rgba(91, 200, 218, 0.16)',
    borderRadius: '14px',
    background: 'linear-gradient(180deg, rgba(15, 46, 58, 0.7) 0%, rgba(7, 28, 38, 0.78) 100%)',
    color: colors.white,
    cursor: $disabled ? 'not-allowed' : 'pointer',
    opacity: $disabled ? 0.55 : 1,
    textAlign: 'left',
    transition:
      'transform 220ms cubic-bezier(0.22, 1, 0.36, 1), border-color 220ms ease, box-shadow 220ms ease, background 220ms ease',
    boxShadow:
      '0 12px 32px -22px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.015) inset',
  }),
  // Hover/focus enhancements live in a tagged-template block so the cyan glow
  // and micro-elevation can use pseudo selectors. styled-components v4 object
  // styles can't express `:hover`/`:focus-visible` blocks cleanly.
  css`
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      border-color: rgba(91, 200, 218, 0.32);
      box-shadow:
        0 16px 36px -22px rgba(0, 0, 0, 0.65),
        0 0 0 1px rgba(255, 255, 255, 0.02) inset,
        0 0 36px -14px rgba(91, 200, 218, 0.45);
    }
    &:focus-visible {
      outline: none;
      border-color: rgba(91, 200, 218, 0.55);
      box-shadow:
        0 0 0 2px rgba(91, 200, 218, 0.35),
        0 0 36px -14px rgba(91, 200, 218, 0.5);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
);

export const StyledServerRowBody = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  flex: 1,
  minWidth: 0,
});

// "Entry" / "Exit" eyebrow label inside the server row. Same kicker treatment
// as the section header but slightly tighter so it nests cleanly.
export const StyledServerRowLabel = styled.div({
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 600,
  lineHeight: '14px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: colors.blue80,
});

export const StyledServerRowValue = styled.div({
  fontFamily: 'Geist, system-ui, sans-serif',
  fontSize: '15px',
  fontWeight: 500,
  lineHeight: '20px',
  letterSpacing: '-0.01em',
  color: colors.white,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

// Right-side chevron — uses currentColor so it inherits the row text color.
export const StyledServerRowArrow = styled.span({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  color: colors.whiteOnDarkBlue60,
  flexShrink: 0,
});

// Cyan-fade divider used between the toggle and the Servers group. Mirrors the
// "linha cyan" pattern from the rest of the VPN.vu views.
export const StyledDivider = styled.div({
  height: '1px',
  width: '100%',
  background:
    'linear-gradient(90deg, transparent 0%, rgba(91, 200, 218, 0.35) 50%, transparent 100%)',
  opacity: 0.6,
});

export const StyledServerRowGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: spacings.tiny,
});
