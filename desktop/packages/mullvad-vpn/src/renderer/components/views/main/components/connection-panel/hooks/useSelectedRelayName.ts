import { useMemo } from 'react';
import { sprintf } from 'sprintf-js';

import { ICustomList } from '../../../../../../../shared/daemon-rpc-types';
import { messages, relayLocations } from '../../../../../../../shared/gettext';
import {
  IRelayLocationCountryRedux,
  RelaySettingsRedux,
} from '../../../../../../redux/settings/reducers';
import { useSelector } from '../../../../../../redux/store';

// PSYCO · resolve o nome legível do servidor selecionado (Automatic / país /
// cidade / "Cidade (hostname)"). Extraído do SelectLocationButton pra ser
// reusado também pela linha "Servidor selecionado" do card de conexão.
export function useSelectedRelayName(): string {
  const relaySettings = useSelector((state) => state.settings.relaySettings);
  const relayLocationsRedux = useSelector((state) => state.settings.relayLocations);
  const customLists = useSelector((state) => state.settings.customLists);

  return useMemo(
    () => getRelayName(relaySettings, customLists, relayLocationsRedux),
    [relaySettings, customLists, relayLocationsRedux],
  );
}

function getRelayName(
  relaySettings: RelaySettingsRedux,
  customLists: Array<ICustomList>,
  locations: IRelayLocationCountryRedux[],
): string {
  if ('normal' in relaySettings) {
    const location = relaySettings.normal.location;

    if (location === 'any') {
      return 'Automatic';
    } else if ('customList' in location) {
      return customLists.find((list) => list.id === location.customList)?.name ?? 'Unknown';
    }

    // Branch guards check both presence AND a usable string value. `'city' in loc`
    // alone is true when the key exists with `undefined`, which used to send the
    // resolver into the city branch with no code to look up — falling straight
    // through to 'Unknown' even though a country was still present. Order
    // matters: hostname > city > country (most specific first).
    if ('hostname' in location && typeof location.hostname === 'string') {
      const country = locations.find(({ code }) => code === location.country);
      if (country) {
        const city = country.cities.find(({ code }) => code === location.city);
        if (city) {
          return sprintf(
            // TRANSLATORS: The selected location label displayed on the main view, when a user selected a specific host to connect to.
            // TRANSLATORS: Example: Malmö (se-mma-001)
            // TRANSLATORS: Available placeholders:
            // TRANSLATORS: %(city)s - a city name
            // TRANSLATORS: %(hostname)s - a hostname
            messages.pgettext('connect-container', '%(city)s (%(hostname)s)'),
            {
              city: relayLocations.gettext(city.name),
              hostname: location.hostname,
            },
          );
        }
      }
    }

    if ('city' in location && typeof location.city === 'string') {
      const country = locations.find(({ code }) => code === location.country);
      if (country) {
        const city = country.cities.find(({ code }) => code === location.city);
        if (city) {
          return relayLocations.gettext(city.name);
        }
      }
    }

    if ('country' in location && typeof location.country === 'string') {
      const country = locations.find(({ code }) => code === location.country);
      if (country) {
        return relayLocations.gettext(country.name);
      }
    }

    return 'Unknown';
  } else if (relaySettings.customTunnelEndpoint) {
    return 'Custom';
  } else {
    throw new Error('Unsupported relay settings.');
  }
}
