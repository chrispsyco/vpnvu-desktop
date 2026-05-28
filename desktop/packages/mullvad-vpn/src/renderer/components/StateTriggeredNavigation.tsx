import { useEffect, useMemo, useRef } from 'react';

import { RoutePath } from '../../shared/routes';
import { useScheduler } from '../../shared/scheduler';
import { getNavigationBase } from '../lib/functions/navigation-base';
import { TransitionType, useHistory } from '../lib/history';
import { useEffectEvent } from '../lib/utility-hooks';
import { useSelector } from '../redux/store';

// VPN.vu · minimum dwell on the launch splash. Without this, the splash
// flashes for a few frames when the daemon was already running before the
// GUI started, because connectedToDaemon flips true before the user can
// register the brand moment. We measure from module load (which fires once
// per renderer process boot) so the wall-clock is consistent across mount
// cycles of this component.
const LAUNCH_MIN_DWELL_MS = 5000;
const APP_BOOT_AT = Date.now();

export default function StateTriggeredNavigation() {
  const { location, reset } = useHistory();

  const connectedToDaemon = useSelector((state) => state.userInterface.connectedToDaemon);
  const loginState = useSelector((state) => state.account.status);
  const hasAcceptedPrivacyDisclaimer = useSelector(
    (state) => state.settings.guiSettings.hasAcceptedPrivacyDisclaimer,
  );
  const pendingCreateAccount = useSelector(
    (state) => state.userInterface.pendingCreateAccount,
  );

  const delayScheduler = useScheduler();

  // VPN.vu · seed prevPath as /launch (the route we force history to start at)
  // not as getNavigationBase(...). When the daemon is already connected at
  // mount time, getNavigationBase returned the *destination* (e.g. /login),
  // and since nextPath equalled prevPath the effect never fired updatePath,
  // so location.pathname stayed at /launch forever — splash hard-froze.
  const prevPath = useRef<RoutePath>(RoutePath.launch);
  const nextPath = useMemo(
    () =>
      getNavigationBase(
        connectedToDaemon,
        loginState,
        hasAcceptedPrivacyDisclaimer,
        pendingCreateAccount,
      ),
    [connectedToDaemon, loginState, hasAcceptedPrivacyDisclaimer, pendingCreateAccount],
  );

  const updatePath = useEffectEvent((nextPath: RoutePath) => {
    const currentPath = location.pathname as RoutePath;

    if (currentPath !== nextPath) {
      delayScheduler.cancel();

      const transition = getNavigationTransition(currentPath, nextPath);
      const delay = getNavigationDelay(currentPath, nextPath);

      const navigate = () => {
        reset(nextPath, { transition });
      };

      if (delay) {
        delayScheduler.schedule(navigate, delay);
      } else {
        navigate();
      }
    }
  });

  useEffect(() => {
    if (nextPath !== prevPath.current) {
      prevPath.current = nextPath;
      updatePath(nextPath);
    }
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPath]);

  return null;
}

function getNavigationDelay(currentPath: RoutePath, nextPath: RoutePath): number | void {
  if (
    currentPath === RoutePath.login &&
    (nextPath === RoutePath.main || nextPath === RoutePath.expired)
  ) {
    return 1000;
  }
  // Hold the splash for at least LAUNCH_MIN_DWELL_MS since boot. If the daemon
  // came back in 80ms, this still gives the brand moment 5 full seconds; if it
  // took 3s, only ~2s of padding gets added.
  if (currentPath === RoutePath.launch) {
    const elapsed = Date.now() - APP_BOOT_AT;
    const remaining = LAUNCH_MIN_DWELL_MS - elapsed;
    if (remaining > 0) return remaining;
  }
}

function getNavigationTransition(currentPath: RoutePath, nextPath: RoutePath) {
  // First level contains the possible next locations and the second level contains the
  // possible current locations.
  const navigationTransitions: Partial<
    Record<RoutePath, Partial<Record<RoutePath | '*', TransitionType>>>
  > = {
    [RoutePath.launch]: {
      [RoutePath.login]: TransitionType.pop,
      [RoutePath.main]: TransitionType.pop,
      '*': TransitionType.dismiss,
    },
    [RoutePath.login]: {
      [RoutePath.launch]: TransitionType.push,
      [RoutePath.main]: TransitionType.pop,
      [RoutePath.deviceRevoked]: TransitionType.pop,
      [RoutePath.tooManyDevices]: TransitionType.pop,
      '*': TransitionType.dismiss,
    },
    [RoutePath.main]: {
      [RoutePath.launch]: TransitionType.push,
      [RoutePath.login]: TransitionType.push,
      [RoutePath.tooManyDevices]: TransitionType.push,
      '*': TransitionType.dismiss,
    },
    [RoutePath.expired]: {
      [RoutePath.launch]: TransitionType.push,
      [RoutePath.login]: TransitionType.push,
      [RoutePath.tooManyDevices]: TransitionType.push,
      '*': TransitionType.dismiss,
    },
    [RoutePath.timeAdded]: {
      [RoutePath.expired]: TransitionType.push,
      [RoutePath.redeemVoucher]: TransitionType.push,
      '*': TransitionType.dismiss,
    },
    [RoutePath.deviceRevoked]: {
      '*': TransitionType.pop,
    },
    [RoutePath.tooManyDevices]: {
      [RoutePath.login]: TransitionType.push,
    },
  };

  return navigationTransitions[nextPath]?.[currentPath] ?? navigationTransitions[nextPath]?.['*'];
}
