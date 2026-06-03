import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { sprintf } from 'sprintf-js';
import styled from 'styled-components';

import { urls } from '../../../../shared/constants';
import { messages } from '../../../../shared/gettext';
import log from '../../../../shared/logging';
import { RoutePath } from '../../../../shared/routes';
import { useAppContext } from '../../../context';
import { LockdownModeSwitch } from '../../../features/tunnel/components';
import { Button } from '../../../lib/components';
import { Image } from '../../../lib/components/image';
import { View } from '../../../lib/components/view';
import { spacings } from '../../../lib/foundations';
import { useHistory } from '../../../lib/history';
import { useExclusiveTask } from '../../../lib/hooks/use-exclusive-task';
import { formatDeviceName } from '../../../lib/utils';
import { useSelector } from '../../../redux/store';
import AccountNumberLabel from '../../AccountNumberLabel';
import { AppMainHeader } from '../../app-main-header';
import DeviceInfoButton from '../../DeviceInfoButton';
import { StyledCustomScrollbars } from '../../ExpiredAccountErrorViewStyles';
import { ModalAlert, ModalAlertType, ModalMessage } from '../../Modal';
import { SettingsListItem } from '../../settings-list-item';
import {
  StyledAccountCard,
  StyledAccountCardLabel,
  StyledAccountCardValue,
  StyledActions,
  StyledCopyHint,
  StyledDescription,
  StyledDeviceRow,
  StyledDivider,
  StyledExpiredAtmosphere,
  StyledExpiredRoot,
  StyledHeading,
  StyledHeroIcon,
  StyledHeroSlot,
  StyledKicker,
  StyledRecoveryHint,
  StyledStack,
} from './ExpiredAccountErrorStyles';

enum RecoveryAction {
  openBrowser,
  disconnect,
  disableLockdownMode,
}

const StyledSettingsToggleListItem = styled(SettingsListItem)`
  margin-top: ${spacings.medium};
`;

// Account number label spec for both Out-of-time and Welcome screens — bumped
// weight + cyan-friendly letter spacing. We keep `AccountNumberLabel` (which
// wraps ClipboardLabel) so the copy-to-clipboard affordance still works.
const StyledAccountNumber = styled(AccountNumberLabel)({
  fontFamily: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: '22px',
  letterSpacing: '0.06em',
  color: 'var(--color-white)',
});

export function ExpiredAccountErrorView() {
  return (
    <ExpiredAccountContextProvider>
      <ExpiredAccountErrorViewComponent />
    </ExpiredAccountContextProvider>
  );
}

function ExpiredAccountErrorViewComponent() {
  const { push } = useHistory();
  const { disconnectTunnel } = useAppContext();

  const { recoveryAction } = useRecoveryAction();
  const isNewAccount = useIsNewAccount();

  const [disconnect, disconnecting] = useExclusiveTask(async () => {
    try {
      await disconnectTunnel('gui-expired-account');
    } catch (e) {
      const error = e as Error;
      log.error(`Failed to disconnect the tunnel: ${error.message}`);
    }
  });

  const navigateToRedeemVoucher = useCallback(() => {
    push(RoutePath.redeemVoucher);
  }, [push]);

  return (
    <View backgroundColor="darkBlue">
      <StyledExpiredRoot>
        <StyledExpiredAtmosphere aria-hidden="true" />
        <AppMainHeader
          variant={isNewAccount ? 'default' : 'basedOnConnectionStatus'}
          size="basedOnLoginStatus">
          <AppMainHeader.AccountButton />
          <AppMainHeader.SettingsButton />
        </AppMainHeader>
        <StyledCustomScrollbars fillContainer>
          <View.Content>
            <View.Container
              flexDirection="column"
              horizontalMargin="large"
              margin={{ top: 'large' }}
              flexGrow={1}
              justifyContent="space-between">
              {isNewAccount ? <WelcomeView /> : <Content />}

              <StyledActions>
                {recoveryAction === RecoveryAction.disconnect && (
                  <Button variant="destructive" disabled={disconnecting} onClick={disconnect}>
                    <Button.Text>
                      {
                        // TRANSLATORS: Button label for disconnecting from the VPN.
                        messages.pgettext('connect-view', 'Disconnect')
                      }
                    </Button.Text>
                  </Button>
                )}

                <ExternalPaymentButton />

                <Button variant="primary" onClick={navigateToRedeemVoucher}>
                  <Button.Text>
                    {
                      // TRANSLATORS: Button label for navigating to the voucher redemption view.
                      messages.pgettext('connect-view', 'Redeem voucher')
                    }
                  </Button.Text>
                </Button>
              </StyledActions>

              <LockdownModeAlert />
            </View.Container>
          </View.Content>
        </StyledCustomScrollbars>
      </StyledExpiredRoot>
    </View>
  );
}

function WelcomeView() {
  const account = useSelector((state) => state.account);
  const { recoveryMessage } = useRecoveryAction();

  return (
    <StyledStack>
      {/* Hero chip with the volcano brand mark sitting on the cyan gradient.
          The image is decorative (the label below carries semantic value). */}
      <StyledHeroSlot>
        <StyledHeroIcon $variant="spark" aria-hidden="true">
          <Image source="logo-icon" alt="" />
        </StyledHeroIcon>
      </StyledHeroSlot>

      <StyledKicker $variant="brand">
        {
          // TRANSLATORS: Eyebrow kicker shown above the welcome title for newly created accounts.
          messages.pgettext('connect-view', 'Welcome · your account is ready')
        }
      </StyledKicker>

      <StyledHeading variant="titleBig" as="h1" data-testid="title">
        {messages.pgettext('connect-view', 'Congrats!')}
      </StyledHeading>

      <StyledDescription>
        {
          // TRANSLATORS: Subtitle shown to a brand-new account, framing the "add time" CTA below.
          messages.pgettext(
            'connect-view',
            'To start using the app, you first need to add time to your account.',
          )
        }
      </StyledDescription>

      <StyledAccountCard>
        <StyledAccountCardLabel>
          {
            // TRANSLATORS: Section label above the account number on the welcome screen.
            messages.pgettext('connect-view', 'Your account number')
          }
        </StyledAccountCardLabel>
        <StyledAccountCardValue>
          <StyledAccountNumber
            accountNumber={account.accountNumber || ''}
            obscureValue={false}
          />
        </StyledAccountCardValue>
        <StyledCopyHint>
          {
            // TRANSLATORS: Tiny hint under the account number telling the user the number is tap-to-copy.
            messages.pgettext('connect-view', 'Tap the number to copy')
          }
        </StyledCopyHint>
        <StyledDeviceRow>
          <span>
            {sprintf(
              // TRANSLATORS: A label that will display the newly created device name to inform the user
              // TRANSLATORS: about it.
              // TRANSLATORS: Available placeholders:
              // TRANSLATORS: %(deviceName)s - The name of the current device
              messages.pgettext('device-management', 'Device name: %(deviceName)s'),
              {
                deviceName: formatDeviceName(account.deviceName ?? ''),
              },
            )}
          </span>
          <DeviceInfoButton />
        </StyledDeviceRow>
      </StyledAccountCard>

      <StyledDivider aria-hidden="true" />

      {/* Recovery hint — small cyan-tinted line that surfaces the recovery
          instruction without competing with the headline. */}
      <StyledRecoveryHint>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <span>{recoveryMessage}</span>
      </StyledRecoveryHint>
    </StyledStack>
  );
}

function Content() {
  const { recoveryMessage } = useRecoveryAction();

  return (
    <StyledStack>
      <StyledHeroSlot>
        <StyledHeroIcon $variant="negative" aria-hidden="true">
          {/* Clock glyph matching the figma `.oot-hero__icon` for out-of-time. */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
               strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </StyledHeroIcon>
      </StyledHeroSlot>

      <StyledKicker $variant="negative">
        {
          // TRANSLATORS: Eyebrow kicker shown above the out-of-time title.
          messages.pgettext('connect-view', 'Time expired')
        }
      </StyledKicker>

      <StyledHeading variant="titleBig" as="h1" data-testid="title">
        {messages.pgettext('connect-view', 'Out of time')}
      </StyledHeading>

      <StyledDescription>
        {
          // TRANSLATORS: Primary out-of-time copy. The recovery hint below carries the actionable detail.
          messages.pgettext(
            'connect-view',
            'You have no more VPN time left on this account.',
          )
        }
      </StyledDescription>

      <StyledDivider aria-hidden="true" />

      {/* Recovery hint — explains *how* to get back online without piling
          another wall of text onto the description. Cyan icon + muted body
          keeps it secondary to the headline. */}
      <StyledRecoveryHint>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <span>{recoveryMessage}</span>
      </StyledRecoveryHint>
    </StyledStack>
  );
}

function ExternalPaymentButton() {
  const { setShowLockdownModeAlert } = useExpiredAccountContext();
  const { recoveryAction } = useRecoveryAction();
  const { openUrlWithAuth } = useAppContext();
  const isNewAccount = useIsNewAccount();

  const buttonText = isNewAccount
    ? messages.gettext('Buy credit')
    : messages.gettext('Buy more credit');

  const [openExternalPayment, openingExternalPayment] = useExclusiveTask(async () => {
    if (recoveryAction === RecoveryAction.disableLockdownMode) {
      setShowLockdownModeAlert(true);
    } else {
      await openUrlWithAuth(urls.purchase);
    }
  });

  return (
    <Button
      variant="primary"
      disabled={openingExternalPayment || recoveryAction === RecoveryAction.disconnect}
      onClick={openExternalPayment}
      aria-description={
        // TRANSLATORS: Accessibility label for the button that opens the browser to buy credit.
        messages.pgettext('accessibility', 'Opens externally')
      }>
      <Button.Text>{buttonText}</Button.Text>
      <Button.Icon icon="external" />
    </Button>
  );
}

function LockdownModeAlert() {
  const { showLockdownModeAlert, setShowLockdownModeAlert } = useExpiredAccountContext();

  const onCloseLockdownModeInstructions = useCallback(() => {
    setShowLockdownModeAlert(false);
  }, [setShowLockdownModeAlert]);

  return (
    <ModalAlert
      isOpen={showLockdownModeAlert}
      type={ModalAlertType.caution}
      buttons={[
        <Button key="cancel" onClick={onCloseLockdownModeInstructions}>
          <Button.Text>{messages.gettext('Close')}</Button.Text>
        </Button>,
      ]}
      close={onCloseLockdownModeInstructions}>
      <ModalMessage>
        {messages.pgettext(
          'connect-view',
          'You need to disable "Lockdown mode" in order to access the Internet to add time.',
        )}
      </ModalMessage>
      <ModalMessage>
        {messages.pgettext(
          'connect-view',
          'Remember, turning it off will allow network traffic while the VPN is disconnected until you turn it back on under Advanced settings.',
        )}
      </ModalMessage>
      <StyledSettingsToggleListItem>
        <SettingsListItem.Item>
          <LockdownModeSwitch>
            <LockdownModeSwitch.Label variant="titleMedium">
              {messages.pgettext('vpn-settings-view', 'Lockdown mode')}
            </LockdownModeSwitch.Label>
            <SettingsListItem.Item.ActionGroup>
              <LockdownModeSwitch.Input />
            </SettingsListItem.Item.ActionGroup>
          </LockdownModeSwitch>
        </SettingsListItem.Item>
      </StyledSettingsToggleListItem>
    </ModalAlert>
  );
}

type ExpiredAccountContextType = {
  setShowLockdownModeAlert: (val: boolean) => void;
  showLockdownModeAlert: boolean;
};

const ExpiredAccountContext = createContext<ExpiredAccountContextType | undefined>(undefined);

const ExpiredAccountContextProvider = ({ children }: { children: ReactNode }) => {
  const [showLockdownModeAlert, setShowLockdownModeAlert] = useState(false);

  const value: ExpiredAccountContextType = useMemo(
    () => ({
      setShowLockdownModeAlert,
      showLockdownModeAlert,
    }),
    [setShowLockdownModeAlert, showLockdownModeAlert],
  );
  return <ExpiredAccountContext.Provider value={value}>{children}</ExpiredAccountContext.Provider>;
};

const useExpiredAccountContext = () => {
  const context = useContext(ExpiredAccountContext);
  if (!context) {
    throw new Error(
      'useExpiredAccountContext must be used within an ExpiredAccountContextProvider',
    );
  }

  return context;
};

const useRecoveryAction = () => {
  const isBlocked = useSelector((state) => state.connection.isBlocked);
  const lockdownMode = useSelector((state) => state.settings.lockdownMode);

  let recoveryAction: RecoveryAction;

  if (lockdownMode && isBlocked) {
    recoveryAction = RecoveryAction.disableLockdownMode;
  } else if (!lockdownMode && isBlocked) {
    recoveryAction = RecoveryAction.disconnect;
  } else {
    recoveryAction = RecoveryAction.openBrowser;
  }

  let recoveryMessage: string;

  switch (recoveryAction) {
    case RecoveryAction.openBrowser:
    case RecoveryAction.disableLockdownMode:
      recoveryMessage = messages.pgettext(
        'connect-view',
        'Either buy credit on our website or redeem a voucher.',
      );
      break;
    case RecoveryAction.disconnect:
      recoveryMessage = messages.pgettext(
        'connect-view',
        'To add more, you will need to disconnect and access the Internet with an unsecure connection.',
      );
      break;
  }

  return { recoveryAction, recoveryMessage };
};

const useIsNewAccount = () => {
  const account = useSelector((state) => state.account);
  return account.status.type === 'ok' && account.status.method === 'new_account';
};
