import React from 'react';
import styled from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import { RoutePath } from '../../../../../../shared/routes';
import { Flex, Text } from '../../../../../lib/components';
import { colors } from '../../../../../lib/foundations';
import { TransitionType, useHistory } from '../../../../../lib/history';
import { useSelector } from '../../../../../redux/store';

const StyledDeviceName = styled(Text)`
  text-transform: capitalize;
  letter-spacing: -0.005em;
`;

// "Manage devices" button · styled as an inline link with cyan accent.
// We can't use `styled(Link) as="button"` because the `as` prop swaps out
// the entire Link wrapper (including its LinkProvider context) for a bare
// <button>, which breaks Link.Text's useLinkContext call.
const StyledManageButton = styled.button`
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${colors.whiteOnBlue40};
  text-decoration: underline;
  text-underline-offset: 2px;
  position: relative;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
      color 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  &:hover {
    transform: translateX(2px);
    color: ${colors.whiteOnBlue40};
  }

  &:focus-visible {
    outline: 2px solid ${colors.white};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

export function DeviceNameRow() {
  const history = useHistory();
  const deviceName = useSelector((state) => state.account.deviceName);

  const navigateToManageDevices = React.useCallback(() => {
    history.push(RoutePath.manageDevices, { transition: TransitionType.push });
  }, [history]);

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <StyledDeviceName variant="bodySmallSemibold">{deviceName}</StyledDeviceName>
      <StyledManageButton onClick={navigateToManageDevices}>
        {
          // TRANSLATORS: Link text in the account view to navigate to the manage devices view.
          messages.pgettext('account-view', 'Manage devices')
        }
      </StyledManageButton>
    </Flex>
  );
}
