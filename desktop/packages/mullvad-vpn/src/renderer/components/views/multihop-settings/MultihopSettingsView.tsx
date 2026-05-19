import { useCallback, useMemo } from 'react';

import { ICustomList, RelayLocation } from '../../../../shared/daemon-rpc-types';
import { messages, relayLocations as relayLocationsCatalog } from '../../../../shared/gettext';
import { RoutePath } from '../../../../shared/routes';
import { LocationType } from '../../../features/locations/types';
import { MultihopSetting } from '../../../features/multihop/components';
import { useMultihop } from '../../../features/multihop/hooks';
import useActions from '../../../lib/actionsHook';
import { FlexColumn } from '../../../lib/components/flex-column';
import { PageTransition } from '../../../lib/components/page-transition';
import { View } from '../../../lib/components/view';
import { TransitionType, useHistory } from '../../../lib/history';
import { useNormalRelaySettings } from '../../../lib/relay-settings-hooks';
import { IRelayLocationCountryRedux } from '../../../redux/settings/reducers';
import { useSelector } from '../../../redux/store';
import userInterfaceActions from '../../../redux/userinterface/actions';
import { AppNavigationHeader } from '../..';
import { BackAction } from '../../keyboard-navigation';
import { NavigationContainer } from '../../NavigationContainer';
import { NavigationScrollbars } from '../../NavigationScrollbars';
import {
  StyledDivider,
  StyledInfoCard,
  StyledInfoCardKicker,
  StyledInfoDescription,
  StyledInfoIllustration,
  StyledMultihopAtmosphere,
  StyledMultihopHero,
  StyledMultihopKicker,
  StyledMultihopRoot,
  StyledMultihopSection,
  StyledMultihopStack,
  StyledMultihopTitle,
  StyledSectionKicker,
  StyledServerRow,
  StyledServerRowArrow,
  StyledServerRowBody,
  StyledServerRowGroup,
  StyledServerRowLabel,
  StyledServerRowValue,
} from './MultihopSettingsStyles';

/**
 * Resolves a wireguard entry/exit `RelayLocation | 'any' | undefined` into a
 * human-readable label. Mirrors the logic in
 * `SelectLocationButton.getRelayName` but trimmed to what the multihop view
 * needs (we don't surface custom tunnel endpoints here — those bypass the
 * multihop screen entirely).
 *
 * Returns the translated location string, or `undefined` when no location is
 * selected (caller renders an "Automatic"/placeholder copy in that case).
 */
function getLocationLabel(
  location: RelayLocation | 'any' | undefined,
  customLists: Array<ICustomList>,
  countries: IRelayLocationCountryRedux[],
): string | undefined {
  if (!location || location === 'any') {
    return undefined;
  }

  if ('customList' in location) {
    return customLists.find((list) => list.id === location.customList)?.name;
  }

  if ('hostname' in location) {
    const country = countries.find(({ code }) => code === location.country);
    const city = country?.cities.find(({ code }) => code === location.city);
    if (city) {
      return `${relayLocationsCatalog.gettext(city.name)} (${location.hostname})`;
    }
    return location.hostname;
  }

  if ('city' in location) {
    const country = countries.find(({ code }) => code === location.country);
    const city = country?.cities.find(({ code }) => code === location.city);
    if (city) {
      return relayLocationsCatalog.gettext(city.name);
    }
  }

  if ('country' in location) {
    const country = countries.find(({ code }) => code === location.country);
    if (country) {
      return relayLocationsCatalog.gettext(country.name);
    }
  }

  return undefined;
}

// Chevron-right glyph — kept as an inline SVG so the cell can colorize it with
// `currentColor` and avoid pulling in an icon dependency for one row.
function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function MultihopSettingsView() {
  const { pop, push } = useHistory();
  const { setSelectLocationView } = useActions(userInterfaceActions);

  const { multihop } = useMultihop();
  const relaySettings = useNormalRelaySettings();
  const customLists = useSelector((state) => state.settings.customLists);
  const countries = useSelector((state) => state.settings.relayLocations);

  // When the user opens the location picker from a specific row we preset the
  // scope (entry/exit) via the userInterface action. The picker itself ignores
  // the `entry` scope when multihop is disabled, so we only push that scope
  // when the toggle is on.
  const openLocationPicker = useCallback(
    (type: LocationType) => {
      if (type === LocationType.entry && !multihop) {
        return;
      }
      setSelectLocationView(type);
      push(RoutePath.selectLocation, { transition: TransitionType.show });
    },
    [multihop, push, setSelectLocationView],
  );

  const entryLabel = useMemo(
    () => getLocationLabel(relaySettings?.wireguard.entryLocation, customLists, countries),
    [relaySettings?.wireguard.entryLocation, customLists, countries],
  );
  const exitLabel = useMemo(
    () => getLocationLabel(relaySettings?.location, customLists, countries),
    [relaySettings?.location, customLists, countries],
  );

  const automaticLabel = messages.gettext('Automatic');

  return (
    <PageTransition>
      <View backgroundColor="darkBlue">
        <StyledMultihopRoot>
          <StyledMultihopAtmosphere aria-hidden="true" />
          <BackAction action={pop}>
            <NavigationContainer>
              <AppNavigationHeader
                title={messages.pgettext('wireguard-settings-view', 'Multihop')}
              />

              <NavigationScrollbars>
                <View.Content>
                  <View.Container horizontalMargin="medium" flexDirection="column" gap="large">
                    <StyledMultihopStack>
                      <StyledMultihopHero>
                        <StyledMultihopKicker>
                          {
                            // TRANSLATORS: Kicker eyebrow above the Multihop page title
                            messages.pgettext('wireguard-settings-view', 'Connection · Multihop')
                          }
                        </StyledMultihopKicker>
                        <StyledMultihopTitle variant="titleBig">
                          {messages.pgettext('wireguard-settings-view', 'Multihop')}
                        </StyledMultihopTitle>
                      </StyledMultihopHero>

                      <StyledInfoCard>
                        <StyledInfoCardKicker>
                          {
                            // TRANSLATORS: Section label above the multihop illustration/description card
                            messages.pgettext('wireguard-settings-view', 'How it works')
                          }
                        </StyledInfoCardKicker>
                        <StyledInfoIllustration source="multihop-illustration" />
                        <StyledInfoDescription variant="labelTiny">
                          {messages.pgettext(
                            'wireguard-settings-view',
                            'Multihop routes your traffic into one WireGuard server and out another, making it harder to trace. This results in increased latency but increases anonymity online.',
                          )}
                        </StyledInfoDescription>
                      </StyledInfoCard>

                      <StyledMultihopSection>
                        <StyledSectionKicker>
                          {
                            // TRANSLATORS: Section kicker label above the multihop toggle
                            messages.pgettext('wireguard-settings-view', 'Setting')
                          }
                        </StyledSectionKicker>
                        <FlexColumn>
                          <MultihopSetting />
                        </FlexColumn>
                      </StyledMultihopSection>

                      {/*
                        Servers section — entry/exit relay selector cards. The
                        cards stay visible (but visually muted + disabled) when
                        multihop is off so the user can see what's available
                        the moment they enable the toggle. Tapping a card
                        navigates to the SelectLocation view with the right
                        scope preselected.
                      */}
                      <StyledMultihopSection>
                        <StyledDivider aria-hidden="true" />
                        <StyledSectionKicker>
                          {
                            // TRANSLATORS: Section kicker label above the entry/exit relay selectors on the Multihop view
                            messages.pgettext('wireguard-settings-view', 'Servers')
                          }
                        </StyledSectionKicker>
                        <StyledServerRowGroup>
                          <StyledServerRow
                            type="button"
                            disabled={!multihop}
                            $disabled={!multihop}
                            onClick={() => openLocationPicker(LocationType.entry)}
                            aria-label={messages.pgettext(
                              'wireguard-settings-view',
                              'Select entry server',
                            )}>
                            <StyledServerRowBody>
                              <StyledServerRowLabel>
                                {messages.pgettext('select-location-view', 'Entry')}
                              </StyledServerRowLabel>
                              <StyledServerRowValue>
                                {entryLabel ?? automaticLabel}
                              </StyledServerRowValue>
                            </StyledServerRowBody>
                            <StyledServerRowArrow>
                              <ChevronRight />
                            </StyledServerRowArrow>
                          </StyledServerRow>

                          <StyledServerRow
                            type="button"
                            onClick={() => openLocationPicker(LocationType.exit)}
                            aria-label={messages.pgettext(
                              'wireguard-settings-view',
                              'Select exit server',
                            )}>
                            <StyledServerRowBody>
                              <StyledServerRowLabel>
                                {messages.pgettext('select-location-view', 'Exit')}
                              </StyledServerRowLabel>
                              <StyledServerRowValue>
                                {exitLabel ?? automaticLabel}
                              </StyledServerRowValue>
                            </StyledServerRowBody>
                            <StyledServerRowArrow>
                              <ChevronRight />
                            </StyledServerRowArrow>
                          </StyledServerRow>
                        </StyledServerRowGroup>
                      </StyledMultihopSection>
                    </StyledMultihopStack>
                  </View.Container>
                </View.Content>
              </NavigationScrollbars>
            </NavigationContainer>
          </BackAction>
        </StyledMultihopRoot>
      </View>
    </PageTransition>
  );
}
