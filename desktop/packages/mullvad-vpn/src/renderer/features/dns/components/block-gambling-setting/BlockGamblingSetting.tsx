import React from 'react';
import styled from 'styled-components';

import { messages } from '../../../../../shared/gettext';
import { ListItem, ListItemProps } from '../../../../lib/components/list-item';
import { BlockGamblingSwitch } from '../block-gambling-switch';

export type BlockGamblingSettingProps = Omit<ListItemProps, 'children'>;

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

const LabelWrap = styled.span({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
});

// Dice-5 · gambling iconography.
function GamblingIcon() {
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
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 8h.01" />
      <path d="M16 8h.01" />
      <path d="M12 12h.01" />
      <path d="M8 16h.01" />
      <path d="M16 16h.01" />
    </svg>
  );
}

export function BlockGamblingSetting(props: BlockGamblingSettingProps) {
  const descriptionId = React.useId();
  return (
    <ListItem level={1} {...props}>
      <ListItem.Item>
        <BlockGamblingSwitch descriptionId={descriptionId}>
          <LabelWrap>
            <IconBox aria-hidden="true">
              <GamblingIcon />
            </IconBox>
            <BlockGamblingSwitch.Label variant="bodySmall">
              {
                // TRANSLATORS: Label for settings that enables block of gamling related websites.
                messages.pgettext('vpn-settings-view', 'Gambling')
              }
            </BlockGamblingSwitch.Label>
          </LabelWrap>
          <ListItem.Item.ActionGroup>
            <BlockGamblingSwitch.Input />
          </ListItem.Item.ActionGroup>
        </BlockGamblingSwitch>
      </ListItem.Item>
      <ListItem.Footer>
        <ListItem.Footer.Text id={descriptionId}>
          {
            // TRANSLATORS: Inline description for the "Gambling" DNS blocker row.
            messages.pgettext('vpn-settings-view', 'Online casinos, sportsbooks')
          }
        </ListItem.Footer.Text>
      </ListItem.Footer>
    </ListItem>
  );
}
