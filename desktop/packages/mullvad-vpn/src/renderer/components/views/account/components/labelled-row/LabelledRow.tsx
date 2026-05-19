import styled from 'styled-components';

import { Text } from '../../../../../lib/components';
import { FlexColumn, FlexColumnProps } from '../../../../../lib/components/flex-column';

type LabelledRowProps = FlexColumnProps & {
  label?: string;
};

// Card container · VPN.vu cyan glow + subtle hover lift, matches the
// figma "ac-number"/"ac-section" blocks. The atmosphere comes from the
// gradient under the border + a slow cyan glow on hover/focus-within.
const StyledCard = styled(FlexColumn)`
  position: relative;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(10, 33, 40, 0.78);
  border: 1px solid rgba(91, 200, 218, 0.16);
  box-shadow: 0 12px 28px -18px rgba(0, 0, 0, 0.55);

  @media (prefers-reduced-motion: no-preference) {
    transition:
      border-color 240ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1),
      background-color 240ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  &:hover {
    border-color: rgba(91, 200, 218, 0.32);
    background: rgba(16, 48, 64, 0.82);
    transform: translateY(-1px);
    box-shadow:
      0 18px 38px -18px rgba(0, 0, 0, 0.65),
      0 0 24px rgba(9, 158, 180, 0.08);
  }

  &:focus-within {
    border-color: rgba(91, 200, 218, 0.5);
    box-shadow:
      0 18px 38px -18px rgba(0, 0, 0, 0.65),
      0 0 0 1px rgba(91, 200, 218, 0.3),
      0 0 28px rgba(9, 158, 180, 0.18);
  }
`;

const StyledLabel = styled(Text)`
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(155, 174, 182, 0.92);
`;

export function LabelledRow({ label, children, ...props }: LabelledRowProps) {
  return (
    <StyledCard gap="small" {...props}>
      <StyledLabel as="span">{label}</StyledLabel>
      {children}
    </StyledCard>
  );
}
