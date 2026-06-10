import styled, { keyframes } from 'styled-components';

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

// PSYCO · faixa fina animada no bottom do header · gradiente fluindo DENTRO da
// cor do status (vermelho desconectado / laranja conectando / verde conectado).
// color-mix (Chromium/Electron) gera os tons escuro/claro sem JS. Paridade com
// o StatusStrip do mobile.
const statusFlow = keyframes`
  from { background-position: 0% 50%; }
  to { background-position: 200% 50%; }
`;
// Mistura simples em JS · NÃO usa color-mix() do CSS (não suportado no Chromium
// do Electron → o background saía inválido/transparente). amt<0 escurece, >0 clareia.
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  if (amt < 0) {
    r *= 1 + amt;
    g *= 1 + amt;
    b *= 1 + amt;
  } else {
    r += (255 - r) * amt;
    g += (255 - g) * amt;
    b += (255 - b) * amt;
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

const StatusStrip = styled.div<{ $dark: string; $color: string; $light: string }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  z-index: 2;
  height: 4px;
  background: linear-gradient(
    90deg,
    ${({ $dark }) => $dark},
    ${({ $color }) => $color},
    ${({ $light }) => $light},
    ${({ $color }) => $color},
    ${({ $dark }) => $dark}
  );
  background-size: 200% 100%;
  animation: ${statusFlow} 2.2s linear infinite;
`;

function statusStripColor(state: TunnelState['state']): string {
  switch (state) {
    case 'connected':
      return '#44D17A';
    case 'connecting':
    case 'disconnecting':
      return '#FFA62E';
    default:
      return '#E34349';
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

  // PSYCO · header NÃO muda mais de cor por status · sempre 'default' (cor
  // original/neutra). O status é comunicado só pela StatusStrip na borda inferior.
  const variant = variantProp === 'basedOnConnectionStatus' ? 'default' : variantProp;

  const loggedIn = useSelector((state) => state.account.status.type === 'ok');
  const size = sizeProp === 'basedOnLoginStatus' ? (loggedIn ? '2' : '1') : sizeProp;

  const stripColor = statusStripColor(connectionStatus.state);

  return (
    <MainHeader variant={variant} size={size} {...props}>
      <div data-app-region="drag">
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
      {/* PSYCO · faixa de status = BORDA INFERIOR do header · absolute, pinada no
          bottom do StyledHeader (position:relative) · full-width, não some atrás
          do conteúdo/notificação. */}
      <StatusStrip
        $dark={shade(stripColor, -0.62)}
        $color={stripColor}
        $light={shade(stripColor, 0.25)}
      />
    </MainHeader>
  );
};

const AppMainHeaderNamespace = Object.assign(AppMainHeader, {
  AccountButton: AppMainHeaderBarAccountButton,
  SettingsButton: AppMainHeaderSettingsButton,
});

export { AppMainHeaderNamespace as AppMainHeader };
