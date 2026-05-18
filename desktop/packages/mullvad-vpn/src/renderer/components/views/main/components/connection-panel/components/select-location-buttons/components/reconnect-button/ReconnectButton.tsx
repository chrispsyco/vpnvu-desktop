import { useCallback } from 'react';
import styled from 'styled-components';

import { RelayLocation } from '../../../../../../../../../../shared/daemon-rpc-types';
import { messages } from '../../../../../../../../../../shared/gettext';
import log from '../../../../../../../../../../shared/logging';
import { useAppContext } from '../../../../../../../../../context';
import { Button, ButtonProps, Icon } from '../../../../../../../../../lib/components';
import { useSelector } from '../../../../../../../../../redux/store';

const StyledReconnectButton = styled(Button)({
  minWidth: '40px',
});

/**
 * Shuffles to a different server in the same country and reconnects. If the
 * country only has one city, falls back to a plain reconnect (which on a real
 * daemon would still pick a different relay if multiple are available).
 *
 * The mock data has 2-city countries (Brasil, Estados Unidos) — this is the
 * easiest way to demo the focus animation jumping between server pins
 * without sending the user back to the location picker.
 */
export function ReconnectButton(props: ButtonProps) {
  const { reconnectTunnel, setRelaySettings } = useAppContext();
  const relayLocations = useSelector((state) => state.settings.relayLocations);
  const relaySettings = useSelector((state) => state.settings.relaySettings);
  const tunnelState = useSelector((state) => state.connection.status.state);

  const onClick = useCallback(async () => {
    try {
      // Pull current country + city out of the relay settings.
      let currentCountry: string | undefined;
      let currentCity: string | undefined;
      if ('normal' in relaySettings) {
        const loc = relaySettings.normal.location;
        if (typeof loc === 'object' && 'only' in loc) {
          const only = loc.only as RelayLocation;
          if ('country' in only && typeof only.country === 'string') {
            currentCountry = only.country;
            if ('city' in only && typeof only.city === 'string') {
              currentCity = only.city;
            }
          }
        }
      }

      // Try to pick a different city in the same country.
      let nextCity: string | undefined = currentCity;
      if (currentCountry) {
        const country = relayLocations.find((c) => c.code === currentCountry);
        if (country && country.cities.length > 1) {
          const candidates = country.cities.filter((c) => c.code !== currentCity);
          if (candidates.length > 0) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            nextCity = pick.code;
          }
        }
      }

      // If we managed to change cities, push it to the daemon — this also
      // updates Redux's connection.latitude/longitude so the globe re-focuses.
      if (currentCountry && nextCity && nextCity !== currentCity) {
        const normal = (relaySettings as { normal: { location: unknown } }).normal;
        await setRelaySettings({
          normal: {
            ...normal,
            location: {
              only: { country: currentCountry, city: nextCity },
            },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      }

      // Reconnect only if we already had a live tunnel. From disconnected
      // we just leave the new selection sitting and let the user hit Connect.
      if (tunnelState === 'connected' || tunnelState === 'connecting') {
        await reconnectTunnel();
      }
    } catch (e) {
      const error = e as Error;
      log.error(`Failed to switch server: ${error.message}`);
    }
  }, [relaySettings, relayLocations, tunnelState, setRelaySettings, reconnectTunnel]);

  return (
    <StyledReconnectButton
      onClick={onClick}
      width="fit"
      aria-label={messages.gettext('Reconnect')}
      {...props}>
      <Icon icon="reconnect" />
    </StyledReconnectButton>
  );
}
