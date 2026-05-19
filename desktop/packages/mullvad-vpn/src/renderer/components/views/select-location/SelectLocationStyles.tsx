import styled, { css, keyframes } from 'styled-components';

import * as Cell from '../../cell';
import { geistMono } from '../../common-styles';
import { ScopeBar } from './components';

// -----------------------------------------------------------------------------
// Select Location · view-level styles (Batch 4 · VPN.vu)
//
// Houses the polished wrappers for the scope bar (Entry/Exit segmented pill),
// the filter chip row, and an optional "current location · saída" card that
// mirrors the figma `.sl-card` block. Keeping these here (instead of forking
// the shared primitives) means the lib components stay reusable for other
// views — we only repaint inside the select-location scope.
// -----------------------------------------------------------------------------

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ScopeBar wrapper · keeps the entry/exit pill spaced from the filter row
// below. We don't override the look of the pill itself here — that's owned by
// ScopeBar.tsx — only the outer margin so the spacing stays a view concern.
export const StyledScopeBar = styled(ScopeBar)({
  marginBottom: '12px',
  alignSelf: 'stretch',
});

export const StyledSelectionUnavailableText = styled(Cell.CellFooterText)({
  textAlign: 'center',
});

// -----------------------------------------------------------------------------
// CURRENT LOCATION CARD · figma `.sl-card` (kicker "Local atual · saída" +
// location title + hostname mono). Exported for future use when the view
// starts surfacing the current selection at the top — currently unused but
// kept here so the typography/colors stay in sync with the rest of the kit.
// -----------------------------------------------------------------------------

export const StyledCurrentLocationCard = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '14px 16px',
    marginBottom: '8px',
    borderRadius: '14px',
    background: 'linear-gradient(180deg, rgba(16, 48, 64, 0.94) 0%, rgba(10, 33, 40, 0.94) 100%)',
    border: '1px solid rgba(91, 200, 218, 0.18)',
    boxShadow:
      '0 12px 32px -20px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.02) inset, 0 0 48px -28px rgba(91, 200, 218, 0.45)',
  },
  css`
    animation: ${fadeUp} 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

export const StyledCurrentLocationKicker = styled.div({
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 600,
  lineHeight: '14px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#5BC8DA',
});

export const StyledCurrentLocationTitle = styled.div({
  fontFamily: 'Geist, system-ui, sans-serif',
  fontSize: '18px',
  fontWeight: 700,
  letterSpacing: '-0.015em',
  lineHeight: '22px',
  color: '#FFFFFF',
});

export const StyledCurrentLocationHostname = styled.div({
  fontFamily: geistMono,
  fontSize: '11px',
  color: '#9BAEB6',
  marginTop: '2px',
  letterSpacing: '0.02em',
});
