import styled, { css, keyframes } from 'styled-components';

import { Text } from '../../../lib/components';
import { colors, spacings } from '../../../lib/foundations';
import { geistMono } from '../../common-styles';

// =============================================================================
// MOTION · gentle atmosphere pulse + staggered reveals
// =============================================================================

const subtleGlow = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.85; }
`;

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

// =============================================================================
// ATMOSPHERE · VPN.vu signature cyan radial blooms. Sits inside the local
// stacking context (StyledExpiredRoot) so the gradient is bounded to the
// view and never leaks behind the header / actions. Two blooms — top-left
// cyan + bottom-right pastel cyan — mirror the figma `body` background.
// =============================================================================

export const StyledExpiredRoot = styled.div({
  position: 'relative',
  isolation: 'isolate',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  minHeight: 0,
});

export const StyledExpiredAtmosphere = styled.div(
  {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: -1,
    background: [
      'radial-gradient(ellipse 1100px 760px at 18% 16%, rgba(9, 158, 180, 0.13), transparent 60%)',
      'radial-gradient(ellipse 780px 580px at 88% 82%, rgba(91, 200, 218, 0.08), transparent 60%)',
    ].join(', '),
  },
  css`
    animation: ${subtleGlow} 9s ease-in-out infinite;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
      opacity: 0.7;
    }
  `,
);

// =============================================================================
// STACK · staggered fade-up for direct children. Used on the hero block in
// both Content (out-of-time) and WelcomeView (new account).
// =============================================================================

export const StyledStack = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: spacings.medium,
    position: 'relative',
    zIndex: 1,
  },
  css`
    > * {
      opacity: 0;
      animation: ${fadeUp} 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    > *:nth-child(1) {
      animation-delay: 40ms;
    }
    > *:nth-child(2) {
      animation-delay: 100ms;
    }
    > *:nth-child(3) {
      animation-delay: 160ms;
    }
    > *:nth-child(4) {
      animation-delay: 220ms;
    }
    > *:nth-child(5) {
      animation-delay: 280ms;
    }
    > *:nth-child(6) {
      animation-delay: 340ms;
    }
    @media (prefers-reduced-motion: reduce) {
      > * {
        opacity: 1;
        animation: none;
      }
    }
  `,
);

// Action stack — fades in after the hero stack so the primary CTA lands last.
export const StyledActions = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: spacings.small,
    position: 'relative',
    zIndex: 1,
  },
  css`
    > * {
      opacity: 0;
      animation: ${fadeUp} 460ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    > *:nth-child(1) {
      animation-delay: 360ms;
    }
    > *:nth-child(2) {
      animation-delay: 420ms;
    }
    > *:nth-child(3) {
      animation-delay: 480ms;
    }
    @media (prefers-reduced-motion: reduce) {
      > * {
        opacity: 1;
        animation: none;
      }
    }
  `,
);

// =============================================================================
// HERO ICON · gradient-filled circle with a soft halo ring. Two flavors:
//   - "negative" → red/cyan border for out-of-time (sits over a translucent
//     red surface so the brand atmosphere stays intact)
//   - "spark" → brand gradient for the welcome state (cyan to deep teal)
// Both flavors use the same outer halo trick (an absolutely positioned
// ::after ring) to evoke the figma `.wlc-hero::after` outline.
// =============================================================================

interface IHeroIconProps {
  // `negative` → red translucent surface for the out-of-time clock glyph
  // `spark`    → brand cyan gradient for the welcome / new-account state.
  //              Hosts either an inline SVG or the VPN.vu volcano logo.
  $variant: 'negative' | 'spark';
}

export const StyledHeroIcon = styled.div<IHeroIconProps>((props) => ({
  position: 'relative',
  width: '72px',
  height: '72px',
  borderRadius: '22px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.white,
  flexShrink: 0,
  background:
    props.$variant === 'spark'
      ? 'linear-gradient(140deg, #5BC8DA 0%, #099EB4 55%, #0E4850 100%)'
      : 'rgba(227, 67, 73, 0.16)',
  border: props.$variant === 'negative' ? '1px solid rgba(227, 67, 73, 0.32)' : 'none',
  boxShadow:
    props.$variant === 'spark'
      ? '0 18px 48px -14px rgba(9, 158, 180, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.08)'
      : 'none',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '-8px',
    borderRadius: '30px',
    border:
      props.$variant === 'spark'
        ? '1px solid rgba(91, 200, 218, 0.22)'
        : '1px solid rgba(227, 67, 73, 0.20)',
    opacity: 0.7,
    pointerEvents: 'none',
  },
  '& svg': {
    width: '32px',
    height: '32px',
    filter:
      props.$variant === 'spark'
        ? 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35))'
        : 'none',
    color: props.$variant === 'negative' ? colors.red : colors.white,
  },
  // Volcano logo art renders larger than the inline SVG kicker. We size it
  // to fill ~70% of the chip and drop a soft shadow so it reads as the focal
  // point against the cyan gradient. `brightness(0) invert(1)` flattens the
  // multi-color PNG to pure white so it sits on the cyan gradient as a clean
  // silhouette instead of competing with the brand background.
  '& img': {
    width: '52px',
    height: '52px',
    objectFit: 'contain',
    filter:
      'brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.45))',
    pointerEvents: 'none',
  },
}));

// =============================================================================
// HERO SLOT · positions the hero chip flush-left. The figma uses
// margin-bottom: 18px (we rely on StyledStack gap of `medium` ≈ 16px instead).
// =============================================================================

export const StyledHeroSlot = styled.div({
  display: 'flex',
  alignItems: 'center',
  marginTop: '4px',
});

// =============================================================================
// EYEBROW / KICKER — small all-caps Geist Mono label above the title.
// `variant` switches accent color (negative for out-of-time, brand for welcome).
// =============================================================================

interface IKickerProps {
  $variant?: 'negative' | 'brand';
}

export const StyledKicker = styled.div<IKickerProps>((props) => ({
  fontFamily: geistMono,
  fontSize: '11px',
  fontWeight: 600,
  lineHeight: '15px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: props.$variant === 'negative' ? colors.red : colors.blue80,
}));

// =============================================================================
// HEADING · editorial gradient title. White → cyan-40 from top-left to
// bottom-right, clipped to the text. Matches the AccountView heading and the
// figma `.oot-hero__title`.
// =============================================================================

export const StyledHeading = styled(Text)`
  letter-spacing: -0.025em;
  line-height: 1.06;
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
// DESCRIPTION · body copy below the heading. Slightly muted, generous
// line-height for readability.
// =============================================================================

export const StyledDescription = styled.p({
  fontSize: '13.5px',
  lineHeight: '20px',
  fontWeight: 400,
  color: colors.whiteOnDarkBlue60,
  margin: 0,
  maxWidth: '320px',
});

// =============================================================================
// ACCOUNT CARD · glassmorph cyan card holding the account number label.
// Used by WelcomeView. Matches the figma `.wlc-account` panel.
// =============================================================================

export const StyledAccountCard = styled.div({
  padding: `${spacings.small} ${spacings.medium}`,
  borderRadius: '14px',
  background:
    'linear-gradient(180deg, rgba(15, 46, 58, 0.78) 0%, rgba(7, 28, 38, 0.82) 100%)',
  border: '1px solid rgba(91, 200, 218, 0.22)',
  backdropFilter: 'blur(28px) saturate(140%)',
  WebkitBackdropFilter: 'blur(28px) saturate(140%)',
  boxShadow:
    '0 12px 32px -16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(91, 200, 218, 0.04) inset',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const StyledAccountCardLabel = styled.div({
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 600,
  lineHeight: '14px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: colors.whiteOnDarkBlue60,
});

export const StyledAccountCardValue = styled.div({
  display: 'flex',
  alignItems: 'center',
  minHeight: '32px',
});

// =============================================================================
// DEVICE ROW · small chip-like row showing the newly-created device name.
// Geist Mono numeric/serial vibe.
// =============================================================================

export const StyledDeviceRow = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: geistMono,
  fontSize: '11.5px',
  fontWeight: 500,
  letterSpacing: '0.06em',
  color: colors.whiteOnDarkBlue60,
});

// =============================================================================
// COPY HINT · subtle mono hint below the account number on welcome screen.
// Mirrors the figma `.oot-input` helper line ("Cole o código aqui" style)
// telling the user the number is tap-to-copy.
// =============================================================================

export const StyledCopyHint = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 500,
  lineHeight: '14px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: colors.whiteOnDarkBlue40,
  marginTop: '2px',
});

// =============================================================================
// RECOVERY HINT · short helper line that supplements the description, used to
// surface the "your privacy isn't protected right now" hint on the out-of-time
// branch (figma `.oot-hero__desc strong`). Cyan-accented body copy.
// =============================================================================

export const StyledRecoveryHint = styled.p({
  margin: 0,
  fontSize: '12.5px',
  lineHeight: '18px',
  fontWeight: 500,
  color: colors.whiteOnBlue40,
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  '& svg': {
    flexShrink: 0,
    width: '14px',
    height: '14px',
    marginTop: '2px',
    color: colors.blue80,
  },
});

// =============================================================================
// SECTION DIVIDER · linear cyan-to-transparent gradient hairline that
// separates the hero text block from the actions. Anti-monotony detail that
// mirrors the figma `.oot-actions` border-top vibe (without the harsh line).
// =============================================================================

export const StyledDivider = styled.div({
  height: '1px',
  width: '100%',
  background:
    'linear-gradient(90deg, rgba(91, 200, 218, 0.0) 0%, rgba(91, 200, 218, 0.35) 50%, rgba(91, 200, 218, 0.0) 100%)',
  marginTop: spacings.small,
  marginBottom: spacings.small,
});
