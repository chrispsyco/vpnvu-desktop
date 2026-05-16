import React from 'react';
import styled from 'styled-components';

import type { IScopeBarItemProps } from '../scope-bar-item';

const StyledScopeBar = styled.div({
  display: 'flex',
  flexDirection: 'row',
  padding: '4px',
  gap: '4px',
  backgroundColor: 'rgba(91, 200, 218, 0.08)',
  border: '1px solid rgba(91, 200, 218, 0.16)',
  borderRadius: '13px',
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
