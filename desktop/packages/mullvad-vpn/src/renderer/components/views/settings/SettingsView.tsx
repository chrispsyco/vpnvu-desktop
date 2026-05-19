import { messages } from '../../../../shared/gettext';
import { usePop } from '../../../history/hooks';
import { FlexColumn } from '../../../lib/components/flex-column';
import { PageTransition, StaggerReveal } from '../../../lib/components/page-transition';
import { View } from '../../../lib/components/view';
import { useVersionCurrent } from '../../../redux/version/hooks';
import { AppNavigationHeader } from '../../';
import { BackAction } from '../../keyboard-navigation';
import { SettingsNavigationScrollbars } from '../../Layout';
import { NavigationContainer } from '../../NavigationContainer';
import {
  ApiAccessMethodsListItem,
  AppInfoListItem,
  DaitaListItem,
  DebugListItem,
  MultihopListItem,
  QuitButton,
  SplitTunnelingListItem,
  SupportListItem,
  UserInterfaceSettingsListItem,
  VpnSettingsListItem,
} from './components';
import { useShowDebug, useShowSplitTunneling, useShowSubSettings } from './hooks';
import {
  StyledQuitWrapper,
  StyledSettingsAtmosphere,
  StyledSettingsBody,
  StyledSettingsFooter,
  StyledSettingsFooterAccent,
  StyledSettingsKicker,
  StyledSettingsSection,
} from './SettingsStyles';

export function SettingsView() {
  const pop = usePop();

  const showSubSettings = useShowSubSettings();
  const showSplitTunneling = useShowSplitTunneling();
  const showDebug = useShowDebug();

  const { current } = useVersionCurrent();

  return (
    <PageTransition>
      <View backgroundColor="darkBlue">
        <StyledSettingsAtmosphere aria-hidden="true" />
        <BackAction action={pop}>
          <NavigationContainer>
            <AppNavigationHeader
              title={
                // TRANSLATORS: Title label in navigation bar
                messages.pgettext('settings-view', 'Settings')
              }
              titleVisible
            />

            <SettingsNavigationScrollbars fillContainer>
              <View.Content>
                <View.Container horizontalMargin="medium" gap="large" flexDirection="column">
                  <StaggerReveal>
                    <StyledSettingsBody>
                      <StyledSettingsSection>
                        <StyledSettingsKicker>
                          {
                            // TRANSLATORS: Section kicker label above the connection-related settings items
                            messages.pgettext('settings-view', 'Connection')
                          }
                        </StyledSettingsKicker>
                        {showSubSettings ? (
                          <FlexColumn gap="medium">
                            <FlexColumn>
                              <DaitaListItem />
                              <MultihopListItem />
                              <VpnSettingsListItem />
                              <UserInterfaceSettingsListItem />
                            </FlexColumn>
                            {showSplitTunneling && <SplitTunnelingListItem position="solo" />}
                          </FlexColumn>
                        ) : (
                          <UserInterfaceSettingsListItem position="solo" />
                        )}
                      </StyledSettingsSection>

                      <StyledSettingsSection>
                        <StyledSettingsKicker>
                          {
                            // TRANSLATORS: Section kicker label above the advanced settings items (API access, etc)
                            messages.pgettext('settings-view', 'Advanced')
                          }
                        </StyledSettingsKicker>
                        <ApiAccessMethodsListItem position="solo" />
                      </StyledSettingsSection>

                      <StyledSettingsSection>
                        <StyledSettingsKicker>
                          {
                            // TRANSLATORS: Section kicker label above the about-the-app settings items
                            messages.pgettext('settings-view', 'About')
                          }
                        </StyledSettingsKicker>
                        <FlexColumn>
                          <SupportListItem />
                          <AppInfoListItem />
                        </FlexColumn>
                        {showDebug && <DebugListItem position="solo" />}
                      </StyledSettingsSection>
                    </StyledSettingsBody>

                    <StyledQuitWrapper>
                      <QuitButton />
                    </StyledQuitWrapper>

                    <StyledSettingsFooter aria-hidden="true">
                      VPN.vu <StyledSettingsFooterAccent>{current}</StyledSettingsFooterAccent>
                    </StyledSettingsFooter>
                  </StaggerReveal>
                </View.Container>
              </View.Content>
            </SettingsNavigationScrollbars>
          </NavigationContainer>
        </BackAction>
      </View>
    </PageTransition>
  );
}
