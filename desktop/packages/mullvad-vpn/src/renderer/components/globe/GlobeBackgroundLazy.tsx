import { lazy, Suspense } from 'react';
import styled from 'styled-components';

import { useFocusOnLocation } from '../../lib/globe/useFocusOnLocation';
import { useSelector } from '../../redux/store';
import { ActiveServerPinState } from './ActiveServerPin';

function toPinState(state: string | undefined): ActiveServerPinState {
  switch (state) {
    case 'connected':
    case 'connecting':
    case 'disconnected':
    case 'disconnecting':
    case 'error':
      return state;
    default:
      return 'idle';
  }
}

/**
 * Lazy-imported R3F scene. Splits three.js, @react-three/fiber and every
 * globe sub-component into a separate chunk so the launch view + any
 * connect screen that never renders a globe (login, settings, etc) don't
 * pay the ~500 KB three.js bundle cost up front.
 *
 * The Suspense fallback below is `null` because the globe is purely
 * decorative — it sits behind the connect UI and a missing frame during
 * boot is invisible to the user.
 */
const LazyGlobeScene = lazy(() =>
  import('./GlobeScene').then((m) => ({ default: m.GlobeScene })),
);

const StyledGlobeWrap = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
`;

/**
 * Drop-in replacement for <GlobeBackground />. Keeps the Redux subscription
 * and focus hook in the eager bundle (they're tiny and have to drive the
 * scene from the moment it mounts), but defers the actual Canvas mount.
 */
export function GlobeBackgroundLazy() {
  const latitude = useSelector((state) => state.connection.latitude);
  const longitude = useSelector((state) => state.connection.longitude);
  const tunnelState = useSelector((state) => state.connection.status.state);

  useFocusOnLocation(latitude, longitude);

  if (window.env.e2e) {
    return null;
  }

  return (
    <StyledGlobeWrap aria-hidden="true">
      <Suspense fallback={null}>
        <LazyGlobeScene
          activeLat={latitude}
          activeLng={longitude}
          connectionState={toPinState(tunnelState)}
        />
      </Suspense>
    </StyledGlobeWrap>
  );
}
