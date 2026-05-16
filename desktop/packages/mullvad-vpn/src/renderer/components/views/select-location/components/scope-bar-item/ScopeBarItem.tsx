import React, { useCallback } from 'react';
import styled from 'styled-components';

import { colors } from '../../../../../lib/foundations';
import { smallText } from '../../../../common-styles';

const StyledScopeBarItem = styled.button<{ selected?: boolean }>(smallText, (props) => ({
  cursor: 'default',
  flex: 1,
  flexBasis: 0,
  padding: '6px 10px',
  borderRadius: '9px',
  color: props.selected ? colors.white : 'rgba(255, 255, 255, 0.7)',
  fontWeight: props.selected ? 600 : 500,
  textAlign: 'center',
  border: 'none',
  backgroundColor: props.selected ? colors.blue80 : 'transparent',
  boxShadow: props.selected ? '0 0 16px rgba(9, 158, 180, 0.35)' : 'none',
  transition: 'background-color 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms cubic-bezier(0.22, 1, 0.36, 1), color 200ms ease',
  '&&:hover': {
    backgroundColor: props.selected ? colors.blue80 : 'rgba(91, 200, 218, 0.10)',
    color: colors.white,
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
