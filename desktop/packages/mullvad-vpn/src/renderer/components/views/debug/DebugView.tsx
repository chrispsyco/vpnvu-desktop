import { useCallback } from 'react';

import { RoutePath } from '../../../../shared/routes';
import useActions from '../../../lib/actionsHook';
import { Button } from '../../../lib/components';
import { View } from '../../../lib/components/view';
import { TransitionType, useHistory } from '../../../lib/history';
import { useBoolean } from '../../../lib/utility-hooks';
import accountActions from '../../../redux/account/actions';
import { AppNavigationHeader } from '../..';
import { BackAction } from '../../keyboard-navigation';
import { NavigationContainer } from '../../NavigationContainer';
import { NavigationScrollbars } from '../../NavigationScrollbars';
import { HeaderTitle } from '../../SettingsHeader';

export function DebugView() {
  const { pop } = useHistory();

  return (
    <View backgroundColor="darkBlue">
      <BackAction action={pop}>
        <NavigationContainer>
          <AppNavigationHeader title="Developer tools" />

          <NavigationScrollbars>
            <View.Content>
              <View.Container horizontalMargin="large" flexDirection="column" gap="medium">
                <HeaderTitle>Developer tools</HeaderTitle>

                <PreviewExpiredViewButton />
                <PreviewEmptyAccountExpiryButton />
                <ThrowErrorButton />
                <UnhandledRejectionButton />
                <ErrorDuringRender />
              </View.Container>
            </View.Content>
          </NavigationScrollbars>
        </NavigationContainer>
      </BackAction>
    </View>
  );
}

// Pushes the expired/welcome view manually. The view internally branches
// between Welcome (new account, no credit) and Out-of-time (expired account)
// based on `account.status.method`. To see Welcome, log in via the "Create a
// new account" button on Login. To see Out-of-time, log in with any 16 digits.
function PreviewExpiredViewButton() {
  const { push } = useHistory();
  const handleClick = useCallback(() => {
    push(RoutePath.expired, { transition: TransitionType.push });
  }, [push]);

  return (
    <Button variant="primary" onClick={handleClick}>
      <Button.Text>Preview · Welcome / Out-of-time view</Button.Text>
    </Button>
  );
}

// Clears the Redux expiry to `undefined` and navigates to /account so the
// FormattedAccountExpiry empty-state CTA renders. The mock can't reach this
// state by itself: setting `accountData.expiry = undefined` from main would
// route to /main/expired (which renders Welcome/Out-of-time, not Account).
// On next account-data IPC notify (e.g. redeem voucher) the real expiry
// flows back in and replaces what this button cleared.
function PreviewEmptyAccountExpiryButton() {
  const { push } = useHistory();
  const { updateAccountExpiry } = useActions(accountActions);
  const handleClick = useCallback(() => {
    updateAccountExpiry(undefined);
    push(RoutePath.account, { transition: TransitionType.show });
  }, [push, updateAccountExpiry]);

  return (
    <Button variant="primary" onClick={handleClick}>
      <Button.Text>Preview · Empty Account expiry</Button.Text>
    </Button>
  );
}

function ThrowErrorButton() {
  const handleClick = useCallback(() => {
    throw new Error('This is a test error');
  }, []);

  return (
    <Button variant="destructive" onClick={handleClick}>
      <Button.Text>Throw error</Button.Text>
    </Button>
  );
}

function UnhandledRejectionButton() {
  const handleClick = useCallback(() => {
    return new Promise((_resolve, reject) => setTimeout(reject, 100));
  }, []);

  return (
    <Button variant="destructive" onClick={handleClick}>
      <Button.Text>Unhandled rejection</Button.Text>
    </Button>
  );
}

function ErrorDuringRender() {
  const [error, setError] = useBoolean(false);

  if (error) {
    throw new Error('This is a test error during render');
  }

  return (
    <Button variant="destructive" onClick={setError}>
      <Button.Text>Error next render</Button.Text>
    </Button>
  );
}
