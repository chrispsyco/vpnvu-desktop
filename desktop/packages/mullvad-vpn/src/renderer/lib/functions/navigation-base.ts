import { RoutePath } from '../../../shared/routes';
import { LoginState } from '../../redux/account/reducers';

export function getNavigationBase(
  connectedToDaemon: boolean,
  loginState: LoginState,
  hasAcceptedPrivacyDisclaimer: boolean = true,
  pendingCreateAccount: boolean = false,
): RoutePath {
  if (connectedToDaemon) {
    // "Criar conta" gate: when LoginView kicked off a create-account flow,
    // force the privacy disclaimer until the wizard finishes (regardless of
    // whether the user has accepted it before — every new account passes
    // through). PrivacyDisclaimerView clears `pendingCreateAccount` right
    // after firing the actual `createNewAccount`, so subsequent re-routes
    // fall through to the normal flow.
    if (
      pendingCreateAccount &&
      loginState.type !== 'ok'
    ) {
      return RoutePath.privacyDisclaimer;
    }
    if (loginState.type === 'none' && loginState.deviceRevoked) {
      return RoutePath.deviceRevoked;
    } else if (
      loginState.type === 'too many devices' ||
      (loginState.type === 'failed' && loginState.error === 'too-many-devices')
    ) {
      return RoutePath.tooManyDevices;
    } else if (
      loginState.type === 'none' ||
      loginState.type === 'logging in' ||
      loginState.type === 'failed'
    ) {
      return RoutePath.login;
    } else if (loginState.type === 'ok' && !hasAcceptedPrivacyDisclaimer) {
      // Post-login gate: the user successfully authenticated (either via an
      // existing account number or via Create new account) but hasn't agreed
      // to the privacy disclaimer on this install yet. Force them through it
      // before they can reach main / expired / time-added. Accepting flips
      // the flag and the next tick re-routes to the correct destination.
      return RoutePath.privacyDisclaimer;
    } else if (loginState.type === 'ok' && loginState.expiredState === 'expired') {
      return RoutePath.expired;
    } else if (loginState.type === 'ok' && loginState.expiredState === 'time_added') {
      return RoutePath.timeAdded;
    } else {
      return RoutePath.main;
    }
  } else {
    return RoutePath.launch;
  }
}
