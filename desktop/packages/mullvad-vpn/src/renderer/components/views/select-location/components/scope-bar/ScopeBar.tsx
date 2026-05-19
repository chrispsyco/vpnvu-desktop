import React from 'react';
import styled from 'styled-components';

import type { IScopeBarItemProps } from '../scope-bar-item';

// -----------------------------------------------------------------------------
// ScopeBar · Entry / Exit (and singlehop/multihop) segmented pill.
//
// Visual treatment mirrors the figma `.toggle-bar__pills` and select-location
// scope bar — a glassmorph cyan-tinted container with rounded-full corners,
// hairline cyan border, and a backdrop-blur so it reads as a floating chip on
// top of the view background. The selected segment is owned by ScopeBarItem;
// here we only set up the bar shell and stretch the items to share the width.
// -----------------------------------------------------------------------------

const StyledScopeBar = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  padding: '4px',
  gap: '4px',
  background: 'rgba(10, 33, 40, 0.85)',
  border: '1px solid rgba(91, 200, 218, 0.18)',
  borderRadius: '999px',
  // backdrop-filter gives the pill a subtle "lift" off the view background —
  // matches the figma toggle-bar treatment and stays cheap in Electron.
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow:
    '0 8px 24px -16px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.02) inset',
});

interface IScopeBarProps {
  selectedIndex: number;
  onChange?: (selectedIndex: number) => void;
  className?: string;
  children: React.ReactElement<IScopeBarItemProps>[];
}

export function ScopeBar(props: IScopeBarProps) {
  const children = React.Children.map(props.children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        selected: index === props.selectedIndex,
        onClick: props.onChange,
        index,
      });
    } else {
      return undefined;
    }
  });

  return <StyledScopeBar className={props.className}>{children}</StyledScopeBar>;
}
