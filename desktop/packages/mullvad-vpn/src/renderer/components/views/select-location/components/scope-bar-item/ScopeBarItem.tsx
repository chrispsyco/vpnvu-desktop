import React, { useCallback } from 'react';
import styled from 'styled-components';

import { colors } from '../../../../../lib/foundations';

// -----------------------------------------------------------------------------
// ScopeBarItem · single segment inside the entry/exit pill.
//
// VPN.vu treatment: Geist Sans semi-bold (not the legacy `smallText`/Open
// Sans), uppercase-leaning tight tracking, no border-on-segment (the parent
// pill owns the chrome). Selected state lights cyan with a soft glow, idle
// segments stay muted. Hover lifts text to white and adds a faint cyan tint.
//
// Note: we don't reuse `smallText` here because that ships Open Sans, which
// clashes with the Geist stack used elsewhere in the view (search field,
// kickers, header card).
// -----------------------------------------------------------------------------

const StyledScopeBarItem = styled.button<{ selected?: boolean }>(({ selected }) => ({
  cursor: 'default',
  flex: 1,
  flexBasis: 0,
  height: '32px',
  padding: '0 14px',
  borderRadius: '999px',
  fontFamily: 'Geist, system-ui, sans-serif',
  fontSize: '13px',
  fontWeight: selected ? 700 : 600,
  letterSpacing: '-0.01em',
  color: selected ? colors.white : 'rgba(255, 255, 255, 0.62)',
  textAlign: 'center',
  border: 'none',
  // brand cyan when selected · faint hover tint when not. The shadow mirrors
  // the figma `.toggle-bar__btn` selected state (24px cyan halo).
  backgroundColor: selected ? colors.blue80 : 'transparent',
  boxShadow: selected
    ? '0 0 0 1px rgba(91, 200, 218, 0.45), 0 0 24px rgba(9, 158, 180, 0.4)'
    : 'none',
  transition:
    'background-color 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1), color 200ms ease',
  '&&:hover': {
    backgroundColor: selected ? colors.blue80 : 'rgba(91, 200, 218, 0.10)',
    color: colors.white,
  },
  '&&:focus-visible': {
    outline: 'none',
    boxShadow: selected
      ? '0 0 0 2px rgba(91, 200, 218, 0.6), 0 0 24px rgba(9, 158, 180, 0.4)'
      : '0 0 0 2px rgba(91, 200, 218, 0.35)',
  },
}));

export interface IScopeBarItemProps {
  index?: number;
  selected?: boolean;
  onClick?: (index: number) => void;
  children?: React.ReactNode;
}

export function ScopeBarItem(props: IScopeBarItemProps) {
  const { onClick: propOnClick } = props;

  const onClick = useCallback(() => {
    if (props.index !== undefined) {
      propOnClick?.(props.index);
    }
  }, [propOnClick, props.index]);

  return props.index !== undefined ? (
    <StyledScopeBarItem selected={props.selected} onClick={onClick}>
      {props.children}
    </StyledScopeBarItem>
  ) : null;
}
