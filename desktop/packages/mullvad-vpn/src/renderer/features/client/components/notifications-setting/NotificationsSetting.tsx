import React from 'react';
import styled from 'styled-components';

import { messages } from '../../../../../shared/gettext';
import { SettingsListItem } from '../../../../components/settings-list-item';
import { ListItemProps } from '../../../../lib/components/list-item';
import { NotificationsSwitch } from '../notifications-switch/NotificationsSwitch';

export type NotificationsSettingProps = Omit<ListItemProps, 'children'>;

/**
 * Cyan icon box matching the Figma "nt-row__icon" vocabulary — a 28x28 square
 * with a soft cyan tint, brand-glow border, and the brand-glow stroke colour
 * for the inline SVG. We render the bell as inline SVG because the project's
 * Icon registry doesn't ship a notifications glyph.
 */
const IconBox = styled.span({
  width: 28,
  height: 28,
  borderRadius: 8,
  background: 'rgba(91, 200, 218, 0.08)',
  border: '1px solid rgba(91, 200, 218, 0.16)',
  color: '#5BC8DA',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

/**
 * Tightens the gap between the icon box and the label so the row reads as a
 * single visual unit, matching the Figma row layout (10px gap + 13px label).
 */
const LabelWrap = styled.span({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
});

function BellIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export function NotificationsSetting(props: NotificationsSettingProps) {
  const descriptionId = React.useId();
  return (
    <SettingsListItem {...props}>
      <SettingsListItem.Item>
        <NotificationsSwitch descriptionId={descriptionId}>
          <LabelWrap>
            <IconBox aria-hidden="true">
              <BellIcon />
            </IconBox>
            <NotificationsSwitch.Label>
              {messages.pgettext('user-interface-settings-view', 'Notifications')}
            </NotificationsSwitch.Label>
          </LabelWrap>
          <SettingsListItem.Item.ActionGroup>
            <NotificationsSwitch.Input />
          </SettingsListItem.Item.ActionGroup>
        </NotificationsSwitch>
      </SettingsListItem.Item>
      <SettingsListItem.Footer>
        <SettingsListItem.Footer.Text id={descriptionId}>
          {messages.pgettext(
            'user-interface-settings-view',
            'Enable or disable system notifications. The critical notifications will always be displayed.',
          )}
        </SettingsListItem.Footer.Text>
      </SettingsListItem.Footer>
    </SettingsListItem>
  );
}
