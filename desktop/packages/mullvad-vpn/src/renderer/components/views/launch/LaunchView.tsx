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
import { AppMainHeader } from '../../app-main-header';
import { TroubleshootingModal } from './components/troubleshooting-modal';

/* ------------------------------------------------------------------ */
/* Splash background atmosphere                                       */
/* ------------------------------------------------------------------ */

const StyledSplash = styled(Flex)`
  position: relative;
  flex: 1;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 32px;
  overflow: hidden;
  background:
    radial-gradient(ellipse 1200px 800px at 18% 14%, rgba(9, 158, 180, 0.18), transparent 62%),
    radial-gradient(ellipse 900px 700px at 88% 88%, rgba(91, 200, 218, 0.09), transparent 62%),
    radial-gradient(circle at 50% 120%, rgba(14, 72, 80, 0.55), transparent 60%);
`;

/* Soft glow blobs behind the logo */
const GlowTopRight = styled.div`
  position: absolute;
  top: -22%;
  right: -14%;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(91, 200, 218, 0.22), transparent 70%);
  filter: blur(40px);
  pointer-events: none;
`;

const GlowBottomLeft = styled.div`
  position: absolute;
  bottom: -18%;
  left: -16%;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle at 60% 60%, rgba(9, 158, 180, 0.18), transparent 70%);
  filter: blur(40px);
  pointer-events: none;
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

const StyledMark = styled.div<{ $variant: 'idle' | 'ready' | 'error' }>`
  width: 112px;
  height: 112px;
  border-radius: 32px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(255, 255, 255);
  animation: ${markEnter} 720ms cubic-bezier(0.22, 1, 0.36, 1) both;

  background: ${({ $variant }) =>
    $variant === 'error'
      ? 'linear-gradient(140deg, rgb(242, 97, 103) 0%, rgb(227, 67, 73) 55%, rgb(146, 40, 45) 100%)'
      : $variant === 'ready'
        ? 'linear-gradient(140deg, rgb(111, 211, 119) 0%, rgb(68, 173, 77) 55%, rgb(46, 135, 54) 100%)'
        : 'linear-gradient(140deg, rgb(91, 200, 218) 0%, rgb(9, 158, 180) 55%, rgb(14, 72, 80) 100%)'};

  box-shadow:
    0 28px 64px -16px
      ${({ $variant }) =>
        $variant === 'error'
          ? 'rgba(227, 67, 73, 0.55)'
          : $variant === 'ready'
            ? 'rgba(68, 173, 77, 0.55)'
            : 'rgba(9, 158, 180, 0.55)'},
    inset 0 0 0 1px rgba(255, 255, 255, 0.10),
    inset 0 -8px 24px rgba(255, 255, 255, 0.08);

  &::before {
    content: '';
    position: absolute;
    inset: -12px;
    border-radius: 40px;
    border: 1px solid
      ${({ $variant }) =>
        $variant === 'error'
          ? 'rgba(227, 67, 73, 0.40)'
          : $variant === 'ready'
            ? 'rgba(68, 173, 77, 0.40)'
            : 'rgba(91, 200, 218, 0.28)'};
    opacity: 0.7;
    pointer-events: none;
  }

  /* Pulsing ring while in idle state */
  &::after {
    content: '';
    position: absolute;
    inset: -12px;
    border-radius: 40px;
    border: 1px solid
      ${({ $variant }) =>
        $variant === 'error'
          ? 'rgba(227, 67, 73, 0.40)'
          : $variant === 'ready'
            ? 'rgba(68, 173, 77, 0.40)'
            : 'rgba(91, 200, 218, 0.45)'};
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

const MarkImage = styled(Image)`
  width: 72%;
  height: 72%;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
  pointer-events: none;
`;

const Wordmark = styled.div`
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 900;
  font-size: 40px;
  letter-spacing: -0.035em;
  color: rgb(255, 255, 255);
  line-height: 1;
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
  color: rgb(155, 174, 182);
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

export function LaunchView() {
  const { tryStartDaemon, showLaunchDaemonSettings } = useAppContext();
  const platform = window.env.platform;
  const { daemonStatus } = useUserInterfaceDaemonStatus();
  const daemonAllowed = useSelector((state) => state.userInterface.daemonAllowed);
  const connectedToDaemon = useSelector((state) => state.userInterface.connectedToDaemon);
  const { current } = useVersionCurrent();

  const splashState = resolveSplashState({
    platform,
    daemonStatus,
    daemonAllowed,
    connectedToDaemon,
  });

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
      <AppMainHeader logoVariant="none">
        <AppMainHeader.SettingsButton />
      </AppMainHeader>
      <StyledSplash flexDirection="column" flexGrow={1}>
          <GlowTopRight />
          <GlowBottomLeft />
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
  canRetry: boolean;
  onRetry: () => void;
  onOpenMacSettings: () => void;
  onShowDetails: () => void;
}

function StatusContent({
  state,
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
          <StatusMessage>
            {
              // TRANSLATORS: Status shown while the app is trying to reach the VPN.vu system service.
              messages.pgettext('launch-view', 'Connecting to system service')
            }
          </StatusMessage>
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
