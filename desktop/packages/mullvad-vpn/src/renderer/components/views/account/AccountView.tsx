import { useCallback, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

import { urls } from '../../../../shared/constants';
import { messages } from '../../../../shared/gettext';
import { useAppContext } from '../../../context';
import { Button, Text } from '../../../lib/components';
import { FlexColumn } from '../../../lib/components/flex-column';
import { View } from '../../../lib/components/view';
import { colors } from '../../../lib/foundations';
import { useHistory } from '../../../lib/history';
import { useExclusiveTask } from '../../../lib/hooks/use-exclusive-task';
import { useEffectEvent } from '../../../lib/utility-hooks';
import { useSelector } from '../../../redux/store';
import { AppNavigationHeader } from '../..';
import { BackAction } from '../../keyboard-navigation';
import { RedeemVoucherButton } from '../../RedeemVoucher';
import { AccountExpiryRow, AccountNumberRow, DeviceNameRow, LabelledRow } from './components';

// VPN.vu cyan glow palette mirrors the figma tokens (#5BC8DA brand glow,
// #099EB4 brand, dark teal surface). Tokens live in foundations/* but the
// figma uses a slightly more atmospheric layering, so we add a couple of
// scoped backgrounds here without shadowing the existing token system.
const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledViewContainer = styled(View.Container)`
  height: 100%;
  justify-content: space-between;
`;

const StyledStack = styled(FlexColumn)`
  > * {
    opacity: 0;
    animation: ${fadeUp} 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  > *:nth-child(1) {
    animation-delay: 40ms;
  }
  > *:nth-child(2) {
    animation-delay: 100ms;
  }
  > *:nth-child(3) {
    animation-delay: 160ms;
  }
  > *:nth-child(4) {
    animation-delay: 220ms;
  }

  @media (prefers-reduced-motion: reduce) {
    > * {
      opacity: 1;
      animation: none;
    }
  }
`;

const StyledHeading = styled(Text)`
  letter-spacing: -0.02em;
  background: linear-gradient(
    135deg,
    ${colors.white} 0%,
    ${colors.whiteOnBlue40} 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
`;

const StyledActions = styled(FlexColumn)`
  position: relative;

  > * {
    opacity: 0;
    animation: ${fadeUp} 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  > *:nth-child(1) {
    animation-delay: 280ms;
  }
  > *:nth-child(2) {
    animation-delay: 340ms;
  }
  > *:nth-child(3) {
    animation-delay: 400ms;
  }

  @media (prefers-reduced-motion: reduce) {
    > * {
      opacity: 1;
      animation: none;
    }
  }
`;

export function AccountView() {
  const history = useHistory();
  const isOffline = useSelector((state) => state.connection.isBlocked);
  const { updateAccountData, openUrlWithAuth, logout } = useAppContext();

  const [buyMore] = useExclusiveTask(async () => {
    await openUrlWithAuth(urls.purchase);
  });

  const onMount = useEffectEvent(() => updateAccountData());
  // These lint rules are disabled for now because the react plugin for eslint does
  // not understand that useEffectEvent should not be added to the dependency array.
  // Enable these rules again when eslint can lint useEffectEvent properly.
  // eslint-disable-next-line react-compiler/react-compiler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => onMount(), []);

  // Hack needed because if we just call `logout` directly in `onClick`
  // then it is run with the wrong `this`.
  const doLogout = useCallback(async () => {
    await logout('gui-logout-button');
  }, [logout]);

  return (
    <View backgroundColor="darkBlue">
      <BackAction action={history.pop}>
        <AppNavigationHeader
          title={
            // TRANSLATORS: Title label in navigation bar
            messages.pgettext('account-view', 'Account')
          }
        />

        <View.Content>
          <StyledViewContainer flexDirection="column" horizontalMargin="medium">
            <FlexColumn gap="large">
              <StyledHeading variant="titleBig">
                {messages.pgettext('account-view', 'Account')}
              </StyledHeading>

              <StyledStack gap="medium">
                <LabelledRow label={messages.pgettext('device-management', 'Device name')}>
                  <DeviceNameRow />
                </LabelledRow>

                <LabelledRow label={messages.pgettext('account-view', 'Account number')}>
                  <AccountNumberRow />
                </LabelledRow>

                <LabelledRow gap="tiny" label={messages.pgettext('account-view', 'Paid until')}>
                  <AccountExpiryRow />
                </LabelledRow>
              </StyledStack>
            </FlexColumn>

            <StyledActions gap="medium">
              <Button
                variant="success"
                disabled={isOffline}
                onClick={buyMore}
                aria-description={messages.pgettext('accessibility', 'Opens externally')}>
                <Button.Text>{messages.gettext('Buy more credit')}</Button.Text>
                <Button.Icon icon="external" />
              </Button>

              <RedeemVoucherButton />

              <Button variant="destructive" onClick={doLogout}>
                <Button.Text>
                  {
                    // TRANSLATORS: Button label for logging out.
                    messages.pgettext('account-view', 'Log out')
                  }
                </Button.Text>
              </Button>
            </StyledActions>
          </StyledViewContainer>
        </View.Content>
      </BackAction>
    </View>
  );
}
