import styled from 'styled-components';

import { colors } from '../../lib/foundations';
import { measurements } from '../common-styles';

interface IStyledGroupProps {
  $noMarginBottom?: boolean;
}

export const Group = styled.div<IStyledGroupProps>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginBottom: props.$noMarginBottom ? '0px' : measurements.rowVerticalMargin,
  backgroundColor: colors.darkBlue,
  borderRadius: '14px',
  border: `1px solid ${colors.blue20}`,
  overflow: 'hidden',
  boxShadow: '0 1px 0 rgba(255, 255, 255, 0.03) inset, 0 8px 24px -16px rgba(0, 0, 0, 0.5)',
}));
