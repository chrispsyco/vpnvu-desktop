import React from 'react';
import styled from 'styled-components';

import { messages } from '../../../../../shared/gettext';
import { geistMono } from '../../../../components/common-styles';
import { SettingsListItem } from '../../../../components/settings-list-item';
import { ListItem, ListItemProps } from '../../../../lib/components/list-item';
import { colors } from '../../../../lib/foundations';
import { useVersionIsBeta } from '../../../../redux/hooks';
import { BetaSwitch } from '../beta-switch';

export type BetaSettingProps = Omit<ListItemProps, 'children'>;

// Cyan tile · same shape as the App Info row tiles (Changelog / Version) so
// the Beta toggle reads as part of the same family.
const StyledIconTile = styled.div<{ $disabled: boolean }>(({ $disabled }) => ({
  flexShrink: 0,
  width: '32px',
  height: '32px',
  borderRadius: '10px',
  background: 'rgba(91, 200, 218, 0.08)',
  border: '1px solid rgba(91, 200, 218, 0.18)',
  color: colors.blue80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: $disabled ? 0.5 : 1,
}));

const StyledSub = styled.div({
  fontFamily: geistMono,
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: colors.whiteOnDarkBlue60,
  marginTop: '2px',
});

const StyledTitleColumn = styled.div({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

// Inline flask glyph (beta program). The shared Icon registry doesn't ship a
// flask/lab/test-tube glyph, so we keep it inline rather than expanding the
// global set just for this row.
const FlaskGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M9 2v6L4 19a2 2 0 0 0 1.8 2.9h12.4A2 2 0 0 0 20 19l-5-11V2" />
    <line x1="9" y1="2" x2="15" y2="2" />
    <line x1="7.5" y1="14" x2="16.5" y2="14" />
  </svg>
);

export function BetaSetting(props: BetaSettingProps) {
  const { isBeta } = useVersionIsBeta();

  const descriptionId = React.useId();

  return (
    <SettingsListItem disabled={isBeta} {...props}>
      <SettingsListItem.Item>
        <BetaSwitch descriptionId={descriptionId}>
          <ListItem.Item.Group gap="medium">
            <StyledIconTile $disabled={isBeta} aria-hidden="true">
              <FlaskGlyph />
            </StyledIconTile>
            <StyledTitleColumn>
              <BetaSwitch.Label>
                {
                  // TRANSLATORS: Label for switch to toggle beta program.
                  messages.pgettext('app-info-view', 'Beta program')
                }
              </BetaSwitch.Label>
              <StyledSub>
                {
                  // TRANSLATORS: Sub-label under the Beta program toggle.
                  messages.pgettext('app-info-view', 'Receive pre-release builds')
                }
              </StyledSub>
            </StyledTitleColumn>
          </ListItem.Item.Group>
          <SettingsListItem.Item.ActionGroup>
            <BetaSwitch.Input />
          </SettingsListItem.Item.ActionGroup>
        </BetaSwitch>
      </SettingsListItem.Item>
      <SettingsListItem.Footer>
        <SettingsListItem.Footer.Text id={descriptionId}>
          {isBeta
            ? // TRANSLATORS: Description for beta program switch when using a beta version.
              messages.pgettext(
                'app-info-view',
                'This option is unavailable while using a beta version.',
              )
            : // TRANSLATORS: Description for beta program switch.
              messages.pgettext(
                'app-info-view',
                'Enable to get notified when new beta versions of the app are released.',
              )}
        </SettingsListItem.Footer.Text>
      </SettingsListItem.Footer>
    </SettingsListItem>
  );
}
