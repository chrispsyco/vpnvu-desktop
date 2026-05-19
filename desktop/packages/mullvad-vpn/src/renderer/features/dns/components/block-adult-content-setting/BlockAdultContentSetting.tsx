import React from 'react';
import styled from 'styled-components';

import { messages } from '../../../../../shared/gettext';
import { ListItem, ListItemProps } from '../../../../lib/components/list-item';
import { BlockAdultContentSwitch } from '../block-adult-content-switch';

export type BlockAdultContentSettingProps = Omit<ListItemProps, 'children'>;

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

// Eye-off · adult content / NSFW kept neutral and abstract.
function AdultContentIcon() {
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
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function BlockAdultContentSetting(props: BlockAdultContentSettingProps) {
  const descriptionId = React.useId();
  return (
    <ListItem level={1} {...props}>
      <ListItem.Item>
        <BlockAdultContentSwitch descriptionId={descriptionId}>
          <LabelWrap>
            <IconBox aria-hidden="true">
              <AdultContentIcon />
            </IconBox>
            <BlockAdultContentSwitch.Label variant="bodySmall">
              {
                // TRANSLATORS: Label for settings that enables block of adult content.
                messages.pgettext('vpn-settings-view', 'Adult content')
              }
            </BlockAdultContentSwitch.Label>
          </LabelWrap>
          <ListItem.Item.ActionGroup>
            <BlockAdultContentSwitch.Input />
          </ListItem.Item.ActionGroup>
        </BlockAdultContentSwitch>
      </ListItem.Item>
      <ListItem.Footer>
        <ListItem.Footer.Text id={descriptionId}>
          {
            // TRANSLATORS: Inline description for the "Adult content" DNS blocker row.
            messages.pgettext('vpn-settings-view', 'NSFW websites')
          }
        </ListItem.Footer.Text>
      </ListItem.Footer>
    </ListItem>
  );
}
