import styled from 'styled-components';

import { messages } from '../../../../shared/gettext';
import {
  AnimateMapSetting,
  MonochromaticTrayIconSetting,
  NotificationsSetting,
  StartMinimizedSetting,
  UnpinnedWindowSetting,
} from '../../../features/client/components';
import { FlexColumn } from '../../../lib/components/flex-column';
import { PageTransition, StaggerReveal } from '../../../lib/components/page-transition';
import { View } from '../../../lib/components/view';
import { useHistory } from '../../../lib/history';
import { useSelector } from '../../../redux/store';
import { AppNavigationHeader } from '../..';
import { BackAction } from '../../keyboard-navigation';
import { NavigationContainer } from '../../NavigationContainer';
import { NavigationScrollbars } from '../../NavigationScrollbars';
import {
  StyledSettingsAtmosphere,
  StyledSettingsBody,
  StyledSettingsKicker,
  StyledSettingsSection,
} from '../settings/SettingsStyles';
import { LanguageListItem } from './components';

/**
 * The AnimateMap toggle is hidden entirely when the user has
 * `prefers-reduced-motion: reduce` set — we keep the same gate here so the
 * "Appearance" section doesn't show a dead row on reduced-motion machines.
 */
const AnimateMapContainer = styled.div({
  '@media (prefers-reduced-motion: reduce)': {
    display: 'none',
  },
});

export function UserInterfaceSettingsView() {
  const { pop } = useHistory();
  const unpinnedWindow = useSelector((state) => state.settings.guiSettings.unpinnedWindow);

  // The unpin/start-minimized pair is OS-gated identically to the legacy view
  // (win32 always, darwin only in development). Mirrors the original logic so
  // we don't ship a hidden toggle to mac users in production.
  const showUnpinnedWindow =
    window.env.platform === 'win32' ||
    (window.env.platform === 'darwin' && window.env.development);
  const showStartMinimized = showUnpinnedWindow && unpinnedWindow;

  return (
    <PageTransition>
      <View backgroundColor="darkBlue">
        <StyledSettingsAtmosphere aria-hidden="true" />
        <BackAction action={pop}>
          <NavigationContainer>
            <AppNavigationHeader
              title={
                // TRANSLATORS: Title label in navigation bar
                messages.pgettext('user-interface-settings-view', 'User interface settings')
              }
              titleVisible
            />

            <NavigationScrollbars>
              <View.Content>
                <View.Container horizontalMargin="medium" gap="large" flexDirection="column">
                  <StaggerReveal>
                    <StyledSettingsBody>
                      {/*
                       * SECTION · Appearance — visual chrome of the app
                       * (map motion, tray icon, language).
                       */}
                      <StyledSettingsSection>
                        <StyledSettingsKicker>
                          {
                            // TRANSLATORS: Section kicker label above the appearance-related UI settings (map animation, tray icon, language)
                            messages.pgettext('user-interface-settings-view', 'Appearance')
                          }
                        </StyledSettingsKicker>
                        <FlexColumn>
                          <AnimateMapContainer>
                            <AnimateMapSetting />
                          </AnimateMapContainer>
                          <MonochromaticTrayIconSetting />
                          <LanguageListItem />
                        </FlexColumn>
                      </StyledSettingsSection>

                      {/*
                       * SECTION · Window — only relevant on platforms where
                       * the app can be unpinned from the taskbar/dock.
                       */}
                      {showUnpinnedWindow && (
                        <StyledSettingsSection>
                          <StyledSettingsKicker>
                            {
                              // TRANSLATORS: Section kicker label above window-behaviour settings (unpinned window, start minimized)
                              messages.pgettext('user-interface-settings-view', 'Window')
                            }
                          </StyledSettingsKicker>
                          <FlexColumn>
                            <UnpinnedWindowSetting />
                            {showStartMinimized && <StartMinimizedSetting />}
                          </FlexColumn>
                        </StyledSettingsSection>
                      )}

                      {/*
                       * SECTION · Notifications — single toggle today; gets
                       * its own kicker so the visual hierarchy mirrors the
                       * Figma reference even when only one row lives here.
                       */}
                      <StyledSettingsSection>
                        <StyledSettingsKicker>
                          {
                            // TRANSLATORS: Section kicker label above the notifications settings
                            messages.pgettext('user-interface-settings-view', 'Notifications')
                          }
                        </StyledSettingsKicker>
                        <NotificationsSetting position="solo" />
                      </StyledSettingsSection>
                    </StyledSettingsBody>
                  </StaggerReveal>
                </View.Container>
              </View.Content>
            </NavigationScrollbars>
          </NavigationContainer>
        </BackAction>
      </View>
    </PageTransition>
  );
}
