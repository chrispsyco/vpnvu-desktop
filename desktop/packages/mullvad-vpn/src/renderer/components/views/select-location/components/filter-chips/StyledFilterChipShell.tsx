import React from 'react';
import styled from 'styled-components';

import { geistMono } from '../../../../common-styles';

// -----------------------------------------------------------------------------
// FilterChipShell · shared VPN.vu repaint for the lib `FilterChip`.
//
// We wrap the lib FilterChip in a styled <span> parent and reach in via
// descendant selectors — same pattern used by LocationSearchField (Batch 3).
//
// Why not `styled(FilterChip)` directly? The lib FilterChip exposes an `as`
// prop (used by DAITA/LWO/QUIC chips to render as a passive <div>). If we
// wrap with `styled(...)`, an `as` prop on the wrapper would swap out the
// FilterChip component itself — killing its FilterChipProvider context and
// breaking the FilterChip.Text / FilterChip.Icon children. The brief calls
// this out explicitly as a gotcha (`styled(Component) as="X"`).
//
// Using a wrapper span keeps the lib chip render path intact and lets us
// repaint colors, borders, typography from the outside.
// -----------------------------------------------------------------------------

const StyledShellWrap = styled.span`
  display: inline-flex;
  vertical-align: middle;

  /* The lib FilterChip renders a single button (or div, via as=) as its root.
     We target it via direct-child selector and bump specificity with && so the
     overrides win against the lib's auto-generated class. */
  && > button,
  && > div {
    --background: rgba(9, 158, 180, 0.18);
    --hover: rgba(9, 158, 180, 0.28);
    --active: rgba(9, 158, 180, 0.36);
    --disabled: rgba(91, 200, 218, 0.08);

    border: 1px solid rgba(91, 200, 218, 0.35);
    border-radius: 999px;
    padding: 4px 8px 4px 12px;
    min-height: 28px;
    transition:
      border-color 160ms ease,
      background-color 160ms ease,
      box-shadow 160ms ease;
  }

  /* Hover / focus ring · only on the interactive button variant. */
  && > button:hover:not(:disabled) {
    border-color: rgba(91, 200, 218, 0.55);
    box-shadow: 0 0 24px -10px rgba(91, 200, 218, 0.5);
  }

  && > button:focus-visible {
    outline: none;
    border-color: rgba(91, 200, 218, 0.7);
    box-shadow: 0 0 0 2px rgba(91, 200, 218, 0.4);
  }

  /* Label · Geist Mono, uppercase, cyan-glow. FilterChip.Text renders a
     <span> via the lib Text/FootnoteMiniSemiBold path. */
  && span {
    font-family: ${geistMono};
    font-size: 11px;
    font-weight: 500;
    line-height: 14px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #5bc8da;
  }

  /* Icon · lib Icon renders a <div role="img"> with background-color (mask
     sprite). Repaint to brand cyan so the close glyph reads as part of the
     chip identity. */
  && div[role='img'] {
    background-color: #5bc8da;
    opacity: 0.85;
  }
`;

// Wraps any lib FilterChip composition in the VPN.vu cyan pill repaint. Just
// drop your <FilterChip>…</FilterChip> as children — the cascade does the rest.
export function FilterChipShell({ children }: { children: React.ReactNode }) {
  return <StyledShellWrap>{children}</StyledShellWrap>;
}
