import { MacOsScrollbarVisibility } from '../../../shared/ipc-schema';
import { DaemonStatus, IChangelog } from '../../../shared/ipc-types';
import { LocationType } from '../../features/locations/types';
import { ReduxAction } from '../store';

export interface IUserInterfaceReduxState {
  locale: string;
  arrowPosition?: number;
  connectionPanelVisible: boolean;
  windowFocused: boolean;
  macOsScrollbarVisibility?: MacOsScrollbarVisibility;
  connectedToDaemon: boolean;
  daemonStatus?: DaemonStatus;
  daemonAllowed?: boolean;
  changelog: IChangelog;
  isPerformingPostUpgrade: boolean;
  selectLocationView: LocationType;
  isMacOs13OrNewer: boolean;
  // Set true by LoginView when the user kicks off "Criar conta". Consumed
  // by getNavigationBase to force /privacy-disclaimer even when the flag is
  // already true (so each new account flow still passes through the wizard).
  pendingCreateAccount: boolean;
}

const initialState: IUserInterfaceReduxState = {
  locale: 'en',
  connectionPanelVisible: false,
  windowFocused: false,
  macOsScrollbarVisibility: undefined,
  connectedToDaemon: false,
  daemonAllowed: undefined,
  changelog: [],
  isPerformingPostUpgrade: false,
  selectLocationView: LocationType.exit,
  isMacOs13OrNewer: true,
  pendingCreateAccount: false,
};

export default function (
  state: IUserInterfaceReduxState = initialState,
  action: ReduxAction,
): IUserInterfaceReduxState {
  switch (action.type) {
    case 'UPDATE_LOCALE':
      return { ...state, locale: action.locale };

    case 'UPDATE_WINDOW_ARROW_POSITION':
      return { ...state, arrowPosition: action.arrowPosition };

    case 'TOGGLE_CONNECTION_PANEL':
      return { ...state, connectionPanelVisible: !state.connectionPanelVisible };

    case 'SET_WINDOW_FOCUSED':
      return { ...state, windowFocused: action.focused };

    case 'SET_MACOS_SCROLLBAR_VISIBILITY':
      return { ...state, macOsScrollbarVisibility: action.visibility };

    case 'SET_CONNECTED_TO_DAEMON':
      return { ...state, connectedToDaemon: action.connectedToDaemon };

    case 'SET_DAEMON_STATUS':
      return {
        ...state,
        daemonStatus: action.daemonStatus,
      };

    case 'SET_DAEMON_ALLOWED':
      return { ...state, daemonAllowed: action.daemonAllowed };

    case 'SET_CHANGELOG':
      return {
        ...state,
        changelog: action.changelog,
      };

    case 'SET_PENDING_CREATE_ACCOUNT':
      return {
        ...state,
        pendingCreateAccount: action.pendingCreateAccount,
      };

    // Clear any stale "Criar conta" flow lock when the create-account flow
    // resolves (success or sign-out). Without ACCOUNT_CREATED in the list
    // the gate would keep the user pinned on /privacy-disclaimer even after
    // a new account was provisioned, because pendingCreateAccount stayed
    // true. LOGGED_OUT also fires on initial app startup if the daemon
    // reports a logged-out device, which makes that one a safe no-op there.
    case 'ACCOUNT_CREATED':
    case 'LOGGED_OUT':
      return {
        ...state,
        pendingCreateAccount: false,
      };

    case 'SET_IS_PERFORMING_POST_UPGRADE':
      return {
        ...state,
        isPerformingPostUpgrade: action.isPerformingPostUpgrade,
      };

    case 'SET_SELECT_LOCATION_VIEW':
      return {
        ...state,
        selectLocationView: action.selectLocationView,
      };

    case 'SET_IS_MACOS13_OR_NEWER':
      return {
        ...state,
        isMacOs13OrNewer: action.isMacOs13OrNewer,
      };

    default:
      return state;
  }
}
