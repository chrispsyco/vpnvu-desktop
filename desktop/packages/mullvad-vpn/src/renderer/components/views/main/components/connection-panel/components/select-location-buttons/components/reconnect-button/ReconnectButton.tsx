import { useCallback } from 'react';
import styled from 'styled-components';

import { RelayLocation, wrapConstraint } from '../../../../../../../../../../shared/daemon-rpc-types';
import { messages } from '../../../../../../../../../../shared/gettext';
import log from '../../../../../../../../../../shared/logging';
import { useAppContext } from '../../../../../../../../../context';
import { Button, ButtonProps, Icon } from '../../../../../../../../../lib/components';
import { useRelaySettingsUpdater } from '../../../../../../../../../lib/constraint-updater';
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
  const { reconnectTunnel } = useAppContext();
  const updateRelaySettings = useRelaySettingsUpdater();
  const relayLocations = useSelector((state) => state.settings.relayLocations);
  const relaySettings = useSelector((state) => state.settings.relaySettings);
  const tunnelState = useSelector((state) => state.connection.status.state);

  const onClick = useCallback(async () => {
    try {
      let currentCountry: string | undefined;
      let currentCity: string | undefined;
      if ('normal' in relaySettings) {
        // Redux stores location *lifted*: app.tsx setReduxRelaySettings runs
        // liftConstraint(), so the value here is either the literal string
        // 'any' or the RelayLocation directly (no `only` wrapper).
        const loc = relaySettings.normal.location as
          | 'any'
          | RelayLocation
          | undefined
          | null;
        if (loc && typeof loc === 'object') {
          if ('country' in loc && typeof loc.country === 'string') {
            currentCountry = loc.country;
            if ('city' in loc && typeof loc.city === 'string') {
              currentCity = loc.city;
            }
          }
        }
      }

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

      if (currentCountry && nextCity && nextCity !== currentCity) {
        const nextLocation: RelayLocation = { country: currentCountry, city: nextCity };
        // useRelaySettingsUpdater rewraps every redux-lifted constraint
        // (wireguard.ipVersion / entryLocation / location) into the
        // `Constraint<T>` shape the daemon IPC actually expects. Calling
        // setRelaySettings directly with a redux-shaped object dropped
        // those wrappers and the daemon ignored the update silently.
        await updateRelaySettings((settings) => ({
          ...settings,
          location: wrapConstraint(nextLocation),
        }));
      }

      if (tunnelState === 'connected' || tunnelState === 'connecting') {
        await reconnectTunnel();
      }
    } catch (e) {
      const error = e as Error;
      log.error(`Failed to switch server: ${error.message}`);
    }
  }, [relaySettings, relayLocations, tunnelState, updateRelaySettings, reconnectTunnel]);

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
