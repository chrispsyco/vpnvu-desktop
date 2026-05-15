import React from 'react';
import styled from 'styled-components';

import { measurements } from '../common-styles';
import { Group } from './Group';

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  includeMarginBottomOnLast?: boolean;
}

export const Row = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'includeMarginBottomOnLast',
})<RowProps>((props) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'transparent',
  minHeight: measurements.rowMinHeight,
  paddingLeft: measurements.horizontalViewMargin,
  paddingRight: measurements.horizontalViewMargin,
  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  transition: 'background-color 180ms cubic-bezier(0.22, 1, 0.36, 1)',
  ':hover': {
    backgroundColor: 'rgba(91, 200, 218, 0.04)',
  },
  [`${Group} > &&:last-child`]: {
    borderBottom: props.includeMarginBottomOnLast ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
  },
}));
