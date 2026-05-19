import styled, { css, keyframes } from 'styled-components';

import { colors, spacings } from '../../../lib/foundations';
import { geistMono } from '../../common-styles';

// =============================================================================
// MOTION · hero fade-up shared by the settings sections + Quit wrapper.
// (The `subtleGlow` keyframe was removed alongside the atmosphere bloom.)
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
// ATMOSPHERE · NO-OP after 2026-05-19 feedback.
// Chris caught that the cyan radial blooms behind the settings/app-info lists
// made those views read noticeably bluer than the Account view (which has no
// atmosphere). To keep the whole settings stack visually consistent with
// Account, we ship the wrapper but render nothing — preserves the existing
// JSX call sites (`<StyledSettingsAtmosphere aria-hidden />`) so we don't
// have to surgically remove the element from every settings view.
// To re-enable: restore the absolute positioning + radial backgrounds.
// =============================================================================

export const StyledSettingsAtmosphere = styled.div({
  display: 'none',
});

// =============================================================================
// CONTENT WRAPPER · sits above the atmosphere
// =============================================================================

export const StyledSettingsBody = styled.div({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: spacings.medium,
});

// =============================================================================
// SECTION · groups a kicker label + a stack of list items. The kicker uses
// the Geist Mono uppercase letterform with generous tracking, matching the
// st-group__title pattern from the figma.
// =============================================================================

export const StyledSettingsSection = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: spacings.small,
  },
  css`
    animation: ${fadeUp} 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

export const StyledSettingsKicker = styled.div({
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
// FOOTER · version line at the bottom of the settings list
// =============================================================================

export const StyledSettingsFooter = styled.div({
  marginTop: spacings.small,
  textAlign: 'center',
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.10em',
  color: colors.whiteOnDarkBlue40,
  textTransform: 'uppercase',
});

export const StyledSettingsFooterAccent = styled.span({
  color: colors.blue80,
});

// =============================================================================
// QUIT WRAPPER · gives the destructive Quit button a bit of breathing room
// from the list and a subtle fade-up so it lands after the rest.
// =============================================================================

export const StyledQuitWrapper = styled.div(
  {
    marginTop: spacings.medium,
  },
  css`
    animation: ${fadeUp} 460ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);
