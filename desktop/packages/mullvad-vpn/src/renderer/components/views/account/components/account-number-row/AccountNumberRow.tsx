import styled from 'styled-components';

import { Text } from '../../../../../lib/components';
import { useSelector } from '../../../../../redux/store';
import AccountNumberLabel from '../../../../AccountNumberLabel';

// Monospace block · matches the figma "ac-number__digits" treatment
// (tabular nums + cyan-tinted ink). ClipboardLabel still renders the
// copy/obscure icon buttons inline.
const StyledAccountText = styled(Text)`
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', monospace;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
  color: rgb(255, 255, 255);
`;

export function AccountNumberRow() {
  const accountNumber = useSelector((state) => state.account.accountNumber);
  return (
    <StyledAccountText as={AccountNumberLabel} accountNumber={accountNumber || ''} />
  );
}
