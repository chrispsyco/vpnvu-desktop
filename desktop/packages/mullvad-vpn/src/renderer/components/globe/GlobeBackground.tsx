import styled from 'styled-components';

import { useFocusOnLocation } from '../../lib/globe/useFocusOnLocation';
import { useSelector } from '../../redux/store';
import { ActiveServerPinState } from './ActiveServerPin';
import { GlobeScene } from './GlobeScene';

/**
 * Absolutely positioned wrapper that drops the R3F globe behind the rest of
 * the Connect screen. Reads the connection coordinates from Redux and feeds
 * them into the focus hook so the globe lerps onto the active server.
 *
 * Also forwards (lat, lng) and the live tunnel state into the scene so the
 * ActiveServerPin can render in the correct colour, and the connection arc
 * appears only while the tunnel is handshaking.
 */
const StyledGlobeWrap = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
`;

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

export function GlobeBackground() {
  const latitude = useSelector((state) => state.connection.latitude);
  const longitude = useSelector((state) => state.connection.longitude);
  const tunnelState = useSelector((state) => state.connection.status.state);

  useFocusOnLocation(latitude, longitude);

  if (window.env.e2e) {
    return null;
  }

  return (
    <StyledGlobeWrap aria-hidden="true">
      <GlobeScene
        activeLat={latitude}
        activeLng={longitude}
        connectionState={toPinState(tunnelState)}
      />
    </StyledGlobeWrap>
  );
}
