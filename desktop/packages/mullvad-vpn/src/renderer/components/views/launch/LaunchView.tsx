import React from 'react';
import styled, { css, keyframes } from 'styled-components';

import { messages } from '../../../../shared/gettext';
import { useAppContext } from '../../../context';
import { Button, Flex } from '../../../lib/components';
import { Image } from '../../../lib/components/image';
import { View } from '../../../lib/components/view';
import { useBoolean } from '../../../lib/utility-hooks';
import { useUserInterfaceDaemonStatus } from '../../../redux/hooks';
import { useSelector } from '../../../redux/store';
import { useVersionCurrent } from '../../../redux/version/hooks/useVersionCurrent';
import { TroubleshootingModal } from './components/troubleshooting-modal';

/* ------------------------------------------------------------------ */
/* Splash background atmosphere                                       */
/* ------------------------------------------------------------------ */

/* O splash agora deixa o globo (via PersistentGlobeLayer) ser o protagonista
   visual. O background do StyledSplash é um deep navy quase preto com um
   leve vinhetar radial para empurrar o foco pro centro, sem competir com
   o globo nem com o logo branco. */
const StyledSplash = styled(Flex)`
  position: relative;
  flex: 1;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 32px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 50%, rgba(7, 19, 25, 0.20), rgba(2, 6, 10, 0.85) 70%),
    rgb(2, 6, 10);
`;

/* GlobeDimmer: véu escuro semi-transparente *acima* do globo persistente,
   que abaixa a saturação cyan do oceano e faz o continente/grid sumirem
   gentilmente atrás do logo. radial-gradient mais opaco no centro (onde
   o logo + tagline ficam) e mais translúcido nas bordas, pra preservar
   alguma sensação de globo girando. */
const GlobeDimmer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 60% 50% at 50% 45%,
    rgba(0, 0, 0, 0.78),
    rgba(0, 0, 0, 0.55) 55%,
    rgba(0, 0, 0, 0.35) 100%
  );
  z-index: 0;
`;

/* Subtle SVG noise grain */
const Grain = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.08;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.71  0 0 0 0 0.78  0 0 0 0 0.85  0 0 0 0.65 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
`;

/* ------------------------------------------------------------------ */
/* Animations                                                         */
/* ------------------------------------------------------------------ */

const fadeUp = keyframes`
  0% { opacity: 0; transform: translate3d(0, 12px, 0); }
  100% { opacity: 1; transform: translate3d(0, 0, 0); }
`;

const markEnter = keyframes`
  0% { opacity: 0; transform: scale(0.86); filter: blur(8px); }
  60% { opacity: 1; filter: blur(0); }
  100% { opacity: 1; transform: scale(1); filter: blur(0); }
`;

const pulseRing = keyframes`
  0% { transform: scale(1); opacity: 0.45; }
  70% { transform: scale(1.18); opacity: 0; }
  100% { transform: scale(1.18); opacity: 0; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const progressSlide = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

/* ------------------------------------------------------------------ */
/* Inner stack                                                        */
/* ------------------------------------------------------------------ */

const SplashInner = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  width: 100%;
  max-width: 360px;
`;

/* StyledMark: container do logo. Antes era um quadrado teal vibrante
   que dominava a tela; agora é só uma moldura sutil/transparente que
   serve pra ancorar a posição do logo sem competir visualmente com o
   wordmark e o status. O variant "ready"/"error" continua tonalizando
   o anel de pulso pra dar feedback de cor sem encher o centro. */
const StyledMark = styled.div<{ $variant: 'idle' | 'ready' | 'error' }>`
  width: 112px;
  height: 112px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(255, 255, 255);
  animation: ${markEnter} 720ms cubic-bezier(0.22, 1, 0.36, 1) both;

  background: transparent;

  /* Pulsing halo while in idle state — sai do anel direto pro contorno
     do logo branco. Sem quadrado de fundo, sem brilho forte. */
  &::after {
    content: '';
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    border: 1px solid
      ${({ $variant }) =>
        $variant === 'error'
          ? 'rgba(242, 97, 103, 0.35)'
          : $variant === 'ready'
            ? 'rgba(111, 211, 119, 0.35)'
            : 'rgba(91, 200, 218, 0.30)'};
    pointer-events: none;
    ${({ $variant }) =>
      $variant === 'idle'
        ? css`
            animation: ${pulseRing} 2400ms ease-out infinite;
          `
        : css`
            animation: none;
          `};
    transform-origin: center;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    &::after {
      animation: none;
    }
  }
`;

/* Logo do VPN.vu deixado em branco puro pra contrastar com o background
   escuro sem brigar com cores. `brightness(0) invert(1)` força toda a
   imagem (cores originais do PNG) a virar branca sólida, mantendo a
   silhueta intacta. drop-shadow sutil pra dar profundidade sem halo. */
const MarkImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.45));
  pointer-events: none;
`;

const Wordmark = styled.div`
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 900;
  font-size: 40px;
  letter-spacing: -0.035em;
  color: rgb(255, 255, 255);
  line-height: 1;
  /* Sombra ampla preta para destacar o wordmark sobre o globo escurecido,
     mantendo o contorno do logo legível mesmo em pontos mais claros do
     mapa. */
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.75);
  animation: ${fadeUp} 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 120ms;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const WordmarkTld = styled.span`
  color: rgb(91, 200, 218);
`;

const Tagline = styled.div`
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  /* Contraste mais firme sobre o globo escurecido. drop-shadow sutil
     evita que a tagline desapareça caso o globo cruze um ponto claro. */
  color: rgba(220, 234, 240, 0.92);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.65);
  margin-top: 10px;
  text-align: center;
  animation: ${fadeUp} 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 220ms;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* ------------------------------------------------------------------ */
/* Status block                                                       */
/* ------------------------------------------------------------------ */

const StatusBlock = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  min-height: 72px;
  width: 100%;
  animation: ${fadeUp} 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 320ms;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const SpinnerRing = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  border: 2.5px solid rgba(91, 200, 218, 0.18);
  border-top-color: rgb(91, 200, 218);
  animation: ${spin} 850ms linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: ${spin} 2400ms linear infinite;
  }
`;

const ProgressTrack = styled.div`
  position: relative;
  width: 240px;
  height: 4px;
  border-radius: 2px;
  background: rgba(10, 33, 40, 0.8);
  overflow: hidden;
  border: 1px solid rgba(91, 200, 218, 0.10);
`;

const ProgressBar = styled.div`
  position: absolute;
  inset: 0;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, rgba(9, 158, 180, 0), rgb(9, 158, 180), rgb(91, 200, 218), rgba(91, 200, 218, 0));
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(91, 200, 218, 0.55);
  animation: ${progressSlide} 1800ms cubic-bezier(0.45, 0, 0.55, 1) infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: ${progressSlide} 3600ms linear infinite;
  }
`;

const CheckBadge = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: rgba(68, 173, 77, 0.20);
  color: rgb(111, 211, 119);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatusMessage = styled.div<{ $tone?: 'default' | 'ready' | 'error' }>`
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  text-align: center;
  color: ${({ $tone }) =>
    $tone === 'ready'
      ? 'rgb(111, 211, 119)'
      : $tone === 'error'
        ? 'rgb(242, 97, 103)'
        : 'rgba(255, 255, 255, 0.78)'};
`;

const ErrorDetail = styled.div`
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.55;
  max-width: 280px;
  text-align: center;
  margin-top: 2px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
  width: 100%;
  max-width: 280px;
`;

/* ------------------------------------------------------------------ */
/* Footer                                                             */
/* ------------------------------------------------------------------ */

const FooterStrip = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  font-weight: 500;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.20em;
  color: rgba(155, 174, 182, 0.65);
  z-index: 1;
  pointer-events: none;
`;

const FooterDot = styled.span`
  color: rgba(155, 174, 182, 0.30);
`;

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

type SplashState = 'connecting' | 'starting' | 'ready' | 'macos-permission' | 'error';

function resolveSplashState(args: {
  platform: string;
  daemonStatus?: string;
  daemonAllowed?: boolean;
  connectedToDaemon: boolean;
}): SplashState {
  const { platform, daemonStatus, daemonAllowed, connectedToDaemon } = args;

  if (connectedToDaemon) return 'ready';
  if (platform === 'darwin' && daemonAllowed === false) return 'macos-permission';
  if (platform === 'win32') {
    if (daemonStatus === 'start-requested') return 'starting';
    if (daemonStatus !== undefined && daemonStatus !== 'start-requested') return 'error';
  }
  return 'connecting';
}

// Minimum time the splash is kept on screen even if the daemon is already
// connected. The daemon often comes back in <300ms which makes the splash
// flash for a fraction of a second — bad UX and zero perceived effort.
// 5s gives the boot ritual room to feel intentional.
const MIN_SPLASH_MS = 5000;
const PHASE_COUNT = 4;
const PHASE_INTERVAL_MS = MIN_SPLASH_MS / PHASE_COUNT;

export function LaunchView() {
  const { tryStartDaemon, showLaunchDaemonSettings } = useAppContext();
  const platform = window.env.platform;
  const { daemonStatus } = useUserInterfaceDaemonStatus();
  const daemonAllowed = useSelector((state) => state.userInterface.daemonAllowed);
  const connectedToDaemon = useSelector((state) => state.userInterface.connectedToDaemon);
  const { current } = useVersionCurrent();

  // Track whether MIN_SPLASH_MS has elapsed. While it hasn't, we override
  // a `ready` daemon state back to `connecting` so the user can actually
  // see the splash. Error states bypass this gate — there's no point
  // padding bad news.
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);
  const [phase, setPhase] = React.useState(0);

  React.useEffect(() => {
    const min = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    const phaseTick = setInterval(() => {
      setPhase((p) => (p + 1 < PHASE_COUNT ? p + 1 : p));
    }, PHASE_INTERVAL_MS);
    return () => {
      clearTimeout(min);
      clearInterval(phaseTick);
    };
  }, []);

  const rawSplashState = resolveSplashState({
    platform,
    daemonStatus,
    daemonAllowed,
    connectedToDaemon,
  });

  // Hold on the connecting view until the minimum splash time has
  // elapsed; let error / mac-permission propagate immediately.
  const splashState: SplashState =
    rawSplashState === 'ready' && !minTimeElapsed ? 'connecting' : rawSplashState;

  const [dialogOpen, showDialog, hideDialog] = useBoolean();

  const handleRetry = React.useCallback(() => {
    tryStartDaemon();
  }, [tryStartDaemon]);

  const handleOpenMacSettings = React.useCallback(async () => {
    await showLaunchDaemonSettings();
  }, [showLaunchDaemonSettings]);

  const markVariant = splashState === 'ready' ? 'ready' : splashState === 'error' || splashState === 'macos-permission' ? 'error' : 'idle';

  return (
    <View>
      {/* No header on the launch splash — the settings button only makes
          sense once the daemon is connected. Showing it here also
          competes visually with the centred wordmark and status text. */}
      <StyledSplash flexDirection="column" flexGrow={1}>
          <GlobeDimmer />
          <Grain />

          <SplashInner>
            <StyledMark $variant={markVariant} role="presentation">
              <MarkImage source="logo-icon" alt="VPN.vu" />
            </StyledMark>

            <TextBlock>
              <Wordmark>
                VPN<WordmarkTld>.vu</WordmarkTld>
              </Wordmark>
              <Tagline>
                {
                  // TRANSLATORS: Tagline shown on the splash/launch screen.
                  messages.pgettext('launch-view', 'Your VPN · no name, no traces')
                }
              </Tagline>
            </TextBlock>

            <StatusBlock role="status" aria-live="polite">
              <StatusContent
                state={splashState}
                phase={phase}
                onRetry={handleRetry}
                onOpenMacSettings={handleOpenMacSettings}
                onShowDetails={showDialog}
                canRetry={daemonStatus === undefined || daemonStatus === 'stopped'}
              />
            </StatusBlock>
          </SplashInner>

          <FooterStrip aria-hidden>
            <span>VPN.vu</span>
            <FooterDot>·</FooterDot>
            <span>{current ? `v${current}` : 'Desktop'}</span>
            <FooterDot>·</FooterDot>
            <span>{platform === 'win32' ? 'Windows' : platform === 'darwin' ? 'macOS' : 'Linux'}</span>
          </FooterStrip>

          <TroubleshootingModal isOpen={dialogOpen} onClose={hideDialog} />
        </StyledSplash>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Status content per state                                           */
/* ------------------------------------------------------------------ */

interface StatusContentProps {
  state: SplashState;
  phase: number;
  canRetry: boolean;
  onRetry: () => void;
  onOpenMacSettings: () => void;
  onShowDetails: () => void;
}

// Rotating boot messages shown during the connecting state. Strings are
// individually `pgettext`'d so each one ends up in the .po catalogue.
// Order matters — phase increments are 1.25s apart and the sequence is
// meant to read as a tiny boot ritual, not a list.
function connectingMessage(phase: number): string {
  switch (phase) {
    case 0:
      // TRANSLATORS: First message shown while the app is booting up.
      return messages.pgettext('launch-view', 'Initializing security');
    case 1:
      // TRANSLATORS: Second message shown while the app is booting up.
      return messages.pgettext('launch-view', 'Connecting to service');
    case 2:
      // TRANSLATORS: Third message shown while the app is booting up.
      return messages.pgettext('launch-view', 'Loading relays');
    default:
      // TRANSLATORS: Final message shown while the app is booting up, right before the main view.
      return messages.pgettext('launch-view', 'Almost ready');
  }
}

function StatusContent({
  state,
  phase,
  canRetry,
  onRetry,
  onOpenMacSettings,
  onShowDetails,
}: StatusContentProps) {
  switch (state) {
    case 'connecting':
      return (
        <>
          <SpinnerRing />
          <StatusMessage>{connectingMessage(phase)}</StatusMessage>
        </>
      );

    case 'starting':
      return (
        <>
          <ProgressTrack>
            <ProgressBar />
          </ProgressTrack>
          <StatusMessage>
            {
              // TRANSLATORS: Status shown while the app is starting the VPN.vu tunnel service.
              messages.pgettext('launch-view', 'Loading tunnel · WireGuard')
            }
          </StatusMessage>
        </>
      );

    case 'ready':
      return (
        <>
          <CheckBadge aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </CheckBadge>
          <StatusMessage $tone="ready">
            {
              // TRANSLATORS: Status shown when the VPN.vu system service is ready.
              messages.pgettext('launch-view', 'Service ready')
            }
          </StatusMessage>
        </>
      );

    case 'macos-permission':
      return (
        <>
          <StatusMessage $tone="error">
            {
              // TRANSLATORS: Status shown when macOS has revoked background permission for the VPN.vu service.
              messages.pgettext('launch-view', 'Permission revoked')
            }
          </StatusMessage>
          <ErrorDetail>
            {
              // TRANSLATORS: Detailed message shown when macOS revoked background permission.
              messages.pgettext(
                'launch-view',
                'The VPN.vu service is not allowed to run in the background. Open System Settings and re-enable it.',
              )
            }
          </ErrorDetail>
          <ButtonRow>
            <Button onClick={onOpenMacSettings}>
              <Button.Text>
                {
                  // TRANSLATORS: Button label that opens macOS system settings.
                  messages.gettext('Go to System Settings')
                }
              </Button.Text>
            </Button>
          </ButtonRow>
        </>
      );

    case 'error':
      return (
        <>
          <StatusMessage $tone="error">
            {
              // TRANSLATORS: Status shown when the VPN.vu system service failed to start.
              messages.pgettext('launch-view', 'Failed to start service')
            }
          </StatusMessage>
          <ErrorDetail>
            {
              // TRANSLATORS: Detailed message shown when the VPN.vu system service failed to start.
              messages.pgettext(
                'launch-view',
                'The VPN.vu service could not be started. Check if another VPN app is running and try again.',
              )
            }
          </ErrorDetail>
          <ButtonRow>
            <Button onClick={onRetry} disabled={!canRetry} variant="destructive">
              <Button.Text>
                {
                  // TRANSLATORS: Button label for retrying to start the service.
                  messages.pgettext('launch-view', 'Try again')
                }
              </Button.Text>
            </Button>
            <Button onClick={onShowDetails}>
              <Button.Text>
                {
                  // TRANSLATORS: Button label for opening dialog with troubleshooting details.
                  messages.pgettext('launch-view', 'Details')
                }
              </Button.Text>
            </Button>
          </ButtonRow>
        </>
      );
  }
}
