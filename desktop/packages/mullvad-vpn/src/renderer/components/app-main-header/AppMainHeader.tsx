import { TunnelState } from '../../../shared/daemon-rpc-types';
import { Flex, HeaderProps, Logo, LogoProps, MainHeader } from '../../lib/components';
import { useSelector } from '../../redux/store';
import { InitialFocus } from '../initial-focus';
import {
  AppMainHeaderBarAccountButton,
  AppMainHeaderDeviceInfo,
  AppMainHeaderSettingsButton,
} from './components';

declare global {
  interface Window {
    windowControls?: {
      close: () => void;
      minimize: () => void;
    };
  }
}

const windowControlBtnStyle: React.CSSProperties = {
  WebkitAppRegion: 'no-drag',
  width: 28,
  height: 28,
  borderRadius: 14,
  border: 0,
  background: 'rgba(255,255,255,0.08)',
  color: '#FFFFFF',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1,
} as React.CSSProperties;

const WindowControls = () => (
  <Flex gap="tiny" alignItems="center">
    <button
      type="button"
      style={windowControlBtnStyle}
      onClick={() => window.windowControls?.minimize()}
      aria-label="Minimizar"
      title="Minimizar">
      —
    </button>
    <button
      type="button"
      style={windowControlBtnStyle}
      onClick={() => window.windowControls?.close()}
      aria-label="Fechar"
      title="Fechar">
      ×
    </button>
  </Flex>
);

export interface MainHeaderProps extends Omit<HeaderProps, 'variant' | 'size'> {
  variant?: HeaderProps['variant'] | 'basedOnConnectionStatus';
  size?: HeaderProps['size'] | 'basedOnLoginStatus';
  logoVariant?: LogoProps['variant'] | 'none';
  children?: React.ReactNode;
}

const AppMainHeader = ({
  logoVariant = 'both',
  variant: variantProp,
  size: sizeProp,
  children,
  ...props
}: MainHeaderProps) => {
  const connectionStatus = useSelector((state) => state.connection.status);

  const variant =
    variantProp === 'basedOnConnectionStatus'
      ? getVariantByTunnelState(connectionStatus)
      : variantProp;

  const loggedIn = useSelector((state) => state.account.status.type === 'ok');
  const size = sizeProp === 'basedOnLoginStatus' ? (loggedIn ? '2' : '1') : sizeProp;

  return (
    <MainHeader variant={variant} size={size} {...props}>
      <div style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <Flex justifyContent="space-between">
          <InitialFocus>
            {logoVariant !== 'none' ? <Logo variant={logoVariant} /> : <div />}
          </InitialFocus>
          <Flex gap="medium" alignItems="center">
            {children}
            <WindowControls />
          </Flex>
        </Flex>
        {size == '2' && (
          <Flex alignItems="flex-end">
            <AppMainHeaderDeviceInfo />
          </Flex>
        )}
      </div>
    </MainHeader>
  );
};

const AppMainHeaderNamespace = Object.assign(AppMainHeader, {
  AccountButton: AppMainHeaderBarAccountButton,
  SettingsButton: AppMainHeaderSettingsButton,
});

export { AppMainHeaderNamespace as AppMainHeader };

const getVariantByTunnelState = (tunnelState: TunnelState): HeaderProps['variant'] => {
  switch (tunnelState.state) {
    case 'disconnected':
      return 'error';
    case 'connecting':
    case 'connected':
      return 'success';
    case 'error':
      return !tunnelState.details.blockingError ? 'success' : 'error';
    case 'disconnecting':
      switch (tunnelState.details) {
        case 'block':
        case 'reconnect':
          return 'success';
        case 'nothing':
          return 'error';
      }
  }
};
